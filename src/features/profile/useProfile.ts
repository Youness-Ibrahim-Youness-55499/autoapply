import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useTranslation } from "../../i18n";
import { supabase } from "../../lib/supabase";
import { emptyCandidateProfile, type CandidateProfile } from "./profile.types";
import { normalizeProfile, profileToRow } from "./profile.utils";

const legacyProfileColumns =
  "full_name, headline, location, desired_roles, skills, work_preference, employment_types, willing_to_relocate, professional_summary, experience, education, onboarding_completed";
const profileColumns = `${legacyProfileColumns}, preferred_locations, minimum_salary, maximum_salary, travel_willingness, company_types, work_authorization, earliest_start_date, notice_period, languages, auto_apply_levels, minimum_match_score, cv_tailoring, cover_letter_preference, application_exclusions`;

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
  const [hasExtendedSchema, setHasExtendedSchema] = useState(true);

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

    if (error?.message.includes("column")) {
      const fallback = await supabase
        .from("profiles")
        .select(legacyProfileColumns)
        .eq("id", userId)
        .maybeSingle();
      setHasExtendedSchema(false);
      if (fallback.error) {
        setLoadErrorMessage(fallback.error.message);
        setIsLoading(false);
        return;
      }
      setProfile(normalizeProfile(fallback.data, fallbackName));
      setIsLoading(false);
      return;
    }

    setHasExtendedSchema(true);
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

    const row = profileToRow(nextProfile);
    const legacyRow = Object.fromEntries(
      Object.entries(row).filter(([key]) => legacyProfileColumns.split(", ").includes(key)),
    );
    const { data, error } = await supabase
      .from("profiles")
      .update(hasExtendedSchema ? row : legacyRow)
      .eq("id", userId)
      .select(hasExtendedSchema ? profileColumns : legacyProfileColumns)
      .maybeSingle();

    if (error || !data) {
      setSaveErrorMessage(
        error?.message ?? t("profile.errors.recordNotFound"),
      );
      setIsSaving(false);
      return false;
    }

    setProfile(hasExtendedSchema ? normalizeProfile(data, fallbackName) : nextProfile);
    setSuccessMessage(t("profile.saved"));
    setIsSaving(false);
    return true;
  }

  return {
    isLoading,
    isSaving,
    hasExtendedSchema,
    loadErrorMessage,
    profile,
    retry: () => setRequestVersion((version) => version + 1),
    saveErrorMessage,
    saveProfile,
    successMessage,
  };
}
