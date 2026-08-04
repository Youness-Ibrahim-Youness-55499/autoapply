import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useTranslation } from "../../i18n";
import { supabase } from "../../lib/supabase";
import { emptyCandidateProfile, type CandidateProfile } from "./profile.types";
import { normalizeProfile, profileToRow } from "./profile.utils";

const profileColumns =
  "full_name, headline, location, desired_roles, skills, work_preference, employment_types, willing_to_relocate, professional_summary, experience, education, onboarding_completed";

export function useProfile() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const metadataName = session?.user.user_metadata.name;
  const fallbackName =
    typeof metadataName === "string" ? metadataName.trim() : "";
  const userId = session?.user.id;
  const [profile, setProfile] = useState<CandidateProfile>({
    ...emptyCandidateProfile,
    fullName: fallbackName,
  });
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoadErrorMessage(t("error.sessionMissing"));
      setIsLoading(false);
      return;
    }

    setLoadErrorMessage("");
    setIsLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(profileColumns)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      setLoadErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setProfile(normalizeProfile(data, fallbackName));
    setIsLoading(false);
  }, [fallbackName, t, userId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile, requestVersion]);

  async function saveProfile(nextProfile: CandidateProfile) {
    if (!userId) {
      setSaveErrorMessage(t("error.sessionMissing"));
      return false;
    }

    setSaveErrorMessage("");
    setSuccessMessage("");
    setIsSaving(true);

    const { data, error } = await supabase
      .from("profiles")
      .update(profileToRow(nextProfile))
      .eq("id", userId)
      .select(profileColumns)
      .maybeSingle();

    if (error || !data) {
      setSaveErrorMessage(
        error?.message ?? t("profile.errors.recordNotFound"),
      );
      setIsSaving(false);
      return false;
    }

    setProfile(normalizeProfile(data, fallbackName));
    setSuccessMessage(t("profile.saved"));
    setIsSaving(false);
    return true;
  }

  return {
    isLoading,
    isSaving,
    loadErrorMessage,
    profile,
    retry: () => setRequestVersion((version) => version + 1),
    saveErrorMessage,
    saveProfile,
    successMessage,
  };
}
