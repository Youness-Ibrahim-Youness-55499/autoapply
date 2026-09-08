import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useTranslation } from "../../i18n";
import { supabase } from "../../lib/supabase";
import {
  acceptedDocumentTypes,
  isDocumentCategory,
  maxDocumentSize,
  type CandidateDocument,
  type DocumentMetadataInput,
  type DocumentStatus,
} from "./document.types";
import { parsePdfCv } from "./cvParser";

const documentColumns =
  "id, storage_path, original_name, display_name, category, notes, is_default, mime_type, size_bytes, processing_status, created_at";

function isDocumentStatus(value: unknown): value is DocumentStatus {
  return (
    value === "uploaded" ||
    value === "processing" ||
    value === "ready" ||
    value === "failed"
  );
}

function normalizeDocument(value: unknown): CandidateDocument | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;

  if (
    typeof row.id !== "string" ||
    typeof row.storage_path !== "string" ||
    typeof row.original_name !== "string" ||
    typeof row.display_name !== "string" ||
    !isDocumentCategory(row.category) ||
    (row.notes !== null && typeof row.notes !== "string") ||
    typeof row.is_default !== "boolean" ||
    typeof row.mime_type !== "string" ||
    typeof row.size_bytes !== "number" ||
    !isDocumentStatus(row.processing_status) ||
    typeof row.created_at !== "string"
  ) {
    return null;
  }

  return {
    category: row.category,
    createdAt: row.created_at,
    displayName: row.display_name,
    id: row.id,
    isDefault: row.is_default,
    mimeType: row.mime_type,
    notes: typeof row.notes === "string" ? row.notes : "",
    originalName: row.original_name,
    processingStatus: row.processing_status,
    sizeBytes: row.size_bytes,
    storagePath: row.storage_path,
  };
}

function safeFileName(name: string) {
  const normalized = name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "resume";
}

export function useDocuments() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const userId = session?.user.id;
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [actionErrorMessage, setActionErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [busyDocumentId, setBusyDocumentId] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  const loadDocuments = useCallback(async () => {
    if (!userId) {
      setLoadErrorMessage(t("error.sessionMissing"));
      setIsLoading(false);
      return;
    }

    setLoadErrorMessage("");
    setIsLoading(true);

    const { data, error } = await supabase
      .from("documents")
      .select(documentColumns)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setLoadErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    const normalized = (data ?? []).map(normalizeDocument);

    if (normalized.some((document) => document === null)) {
      setLoadErrorMessage(t("documents.errors.unexpectedFormat"));
      setIsLoading(false);
      return;
    }

    setDocuments(normalized as CandidateDocument[]);
    setIsLoading(false);
  }, [t, userId]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments, requestVersion]);

  async function uploadDocument(
    file: File,
    metadata: Pick<DocumentMetadataInput, "category" | "displayName" | "notes">,
  ) {
    setActionErrorMessage("");
    setSuccessMessage("");

    if (!userId) {
      setActionErrorMessage(t("error.sessionMissing"));
      return false;
    }

    if (!acceptedDocumentTypes.includes(file.type as (typeof acceptedDocumentTypes)[number])) {
      setActionErrorMessage(t("documents.errors.invalidType"));
      return false;
    }

    if (file.size <= 0 || file.size > maxDocumentSize) {
      setActionErrorMessage(t("documents.errors.tooLarge"));
      return false;
    }

    const displayName = metadata.displayName.trim();
    const notes = metadata.notes.trim();

    if (!displayName || displayName.length > 160) {
      setActionErrorMessage(t("documents.errors.nameLength"));
      return false;
    }

    if (!isDocumentCategory(metadata.category)) {
      setActionErrorMessage(t("documents.errors.invalidCategory"));
      return false;
    }

    if (notes.length > 5000) {
      setActionErrorMessage(t("documents.errors.notesTooLong"));
      return false;
    }

    setIsUploading(true);
    const storagePath = `${userId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error: storageError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      setActionErrorMessage(storageError.message);
      setIsUploading(false);
      return false;
    }

    const { data, error: metadataError } = await supabase
      .from("documents")
      .insert({
        mime_type: file.type,
        category: metadata.category,
        display_name: displayName,
        notes: notes || null,
        original_name: file.name,
        size_bytes: file.size,
        storage_path: storagePath,
        user_id: userId,
      })
      .select(documentColumns)
      .single();

    if (metadataError) {
      await supabase.storage.from("resumes").remove([storagePath]);
      setActionErrorMessage(metadataError.message);
      setIsUploading(false);
      return false;
    }

    const document = normalizeDocument(data);

    if (!document) {
      await supabase.storage.from("resumes").remove([storagePath]);
      setActionErrorMessage(t("documents.errors.uploadedUnexpectedFormat"));
      setIsUploading(false);
      return false;
    }

    setDocuments((current) => [document, ...current]);
    const shouldParse = metadata.category === "cv" && file.type === "application/pdf";

    if (shouldParse) {
      setDocuments((current) =>
        current.map((item) =>
          item.id === document.id ? { ...item, processingStatus: "processing" } : item,
        ),
      );

      try {
        await parsePdfCv({
          accessToken: session.access_token,
          documentId: document.id,
        });
        setDocuments((current) =>
          current.map((item) =>
            item.id === document.id ? { ...item, processingStatus: "ready" } : item,
          ),
        );
        setSuccessMessage(t("documents.uploadedAndParsed"));
      } catch (error) {
        await supabase
          .from("documents")
          .update({ processing_status: "failed" })
          .eq("id", document.id)
          .eq("user_id", userId);
        setDocuments((current) =>
          current.map((item) =>
            item.id === document.id ? { ...item, processingStatus: "failed" } : item,
          ),
        );
        setActionErrorMessage(
          t("documents.errors.parseFailed", {
            message: error instanceof Error ? error.message : t("documents.errors.parseUnknown"),
          }),
        );
      }
    } else {
      setSuccessMessage(t("documents.uploaded"));
    }
    setIsUploading(false);
    return true;
  }

  async function updateDocument(
    document: CandidateDocument,
    metadata: DocumentMetadataInput,
  ) {
    if (!userId) {
      setActionErrorMessage(t("error.sessionMissing"));
      return false;
    }

    const displayName = metadata.displayName.trim();
    const notes = metadata.notes.trim();

    if (!displayName || displayName.length > 160) {
      setActionErrorMessage(t("documents.errors.nameLength"));
      return false;
    }

    if (!isDocumentCategory(metadata.category)) {
      setActionErrorMessage(t("documents.errors.invalidCategory"));
      return false;
    }

    if (notes.length > 5000) {
      setActionErrorMessage(t("documents.errors.notesTooLong"));
      return false;
    }

    setActionErrorMessage("");
    setSuccessMessage("");
    setBusyDocumentId(document.id);

    const shouldBeDefault = metadata.category === "cv" && metadata.isDefault;

    const { data, error } = await supabase
      .rpc("update_document_metadata", {
        p_category: metadata.category,
        p_display_name: displayName,
        p_document_id: document.id,
        p_is_default: shouldBeDefault,
        p_notes: notes,
      })
      .maybeSingle();

    if (error || !data) {
      setActionErrorMessage(
        error?.message ?? t("documents.errors.updateFailed"),
      );
      setBusyDocumentId("");
      return false;
    }

    const updated = normalizeDocument(data);

    if (!updated) {
      setActionErrorMessage(t("documents.errors.updatedUnexpectedFormat"));
      setBusyDocumentId("");
      return false;
    }

    setDocuments((current) =>
      current.map((item) => {
        if (item.id === updated.id) return updated;
        if (shouldBeDefault && item.category === "cv") {
          return { ...item, isDefault: false };
        }
        return item;
      }),
    );
    setSuccessMessage(t("documents.updated"));
    setBusyDocumentId("");
    return true;
  }

  async function openDocument(document: CandidateDocument) {
    setActionErrorMessage("");
    setSuccessMessage("");
    setBusyDocumentId(document.id);

    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(document.storagePath, 60);

    if (error) {
      setActionErrorMessage(error.message);
      setBusyDocumentId("");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    setBusyDocumentId("");
  }

  async function deleteDocument(document: CandidateDocument) {
    if (!userId) {
      setActionErrorMessage(t("error.sessionMissing"));
      return false;
    }

    setActionErrorMessage("");
    setSuccessMessage("");
    setBusyDocumentId(document.id);

    const { error: storageError } = await supabase.storage
      .from("resumes")
      .remove([document.storagePath]);

    if (storageError) {
      setActionErrorMessage(storageError.message);
      setBusyDocumentId("");
      return false;
    }

    const { error: metadataError } = await supabase
      .from("documents")
      .delete()
      .eq("id", document.id)
      .eq("user_id", userId);

    if (metadataError) {
      setActionErrorMessage(
        `${metadataError.message}${t("documents.errors.deleteMetadataSuffix")}`,
      );
      setBusyDocumentId("");
      return false;
    }

    setDocuments((current) => current.filter((item) => item.id !== document.id));
    setSuccessMessage(t("documents.deleted"));
    setBusyDocumentId("");
    return true;
  }

  return {
    actionErrorMessage,
    busyDocumentId,
    deleteDocument,
    documents,
    isLoading,
    isUploading,
    loadErrorMessage,
    openDocument,
    retry: () => setRequestVersion((version) => version + 1),
    successMessage,
    updateDocument,
    uploadDocument,
  };
}
