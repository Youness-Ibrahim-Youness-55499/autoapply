import { ProductPageHeader } from "../components/app/ProductPageHeader";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/states/EmptyState";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { Button } from "../components/ui/Button";
import { DocumentList } from "../features/documents/components/DocumentList";
import { DocumentUpload } from "../features/documents/components/DocumentUpload";
import { useDocuments } from "../features/documents/useDocuments";

export function DocumentsPage() {
  const {
    actionErrorMessage,
    busyDocumentId,
    deleteDocument,
    documents,
    isLoading,
    isUploading,
    loadErrorMessage,
    openDocument,
    retry,
    successMessage,
    updateDocument,
    uploadDocument,
  } = useDocuments();

  return (
    <>
      <Seo
        description="Manage the private source documents used for your applications."
        noIndex
        path="/app/documents"
        title="Documents"
      />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <ProductPageHeader
          description="Organize CVs, cover letters, certificates, and references in your private workspace."
          title="Documents"
        />

        <div className="mt-10 max-w-5xl">
          {isLoading && (
            <LoadingState
              description="Loading your private document records."
              title="Loading documents"
            />
          )}

          {!isLoading && loadErrorMessage && (
            <ErrorState
              action={<Button onClick={retry}>Try again</Button>}
              description={loadErrorMessage}
              title="Documents could not be loaded"
            />
          )}

          {!isLoading && !loadErrorMessage && (
            <>
              <DocumentUpload
                isUploading={isUploading}
                onUpload={uploadDocument}
              />

              <div aria-live="polite">
                {successMessage && (
                  <p className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-900">
                    {successMessage}
                  </p>
                )}
                {actionErrorMessage && (
                  <p
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    role="alert"
                  >
                    {actionErrorMessage}
                  </p>
                )}
              </div>

              {documents.length > 0 ? (
                <DocumentList
                  busyDocumentId={busyDocumentId}
                  documents={documents}
                  onDelete={deleteDocument}
                  onEdit={updateDocument}
                  onOpen={openDocument}
                />
              ) : (
                <div className="mt-8">
                  <EmptyState
                    description="Upload your first CV, cover letter, certificate, or reference as a PDF or DOCX file."
                    title="No documents uploaded"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </>
  );
}
