import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";
import { emptyCandidateProfile, type CandidateProfile } from "./profile.types";
import { normalizeProfile, profileToRow } from "./profile.utils";

const profileColumns =
  "full_name, headline, location, desired_roles, skills, work_preference, employment_types, willing_to_relocate, professional_summary, experience, education, onboarding_completed";

export function useProfile() {
  const { session } = useAuth();
  const metadataName = session?.user.user_metadata.name;
  const fallbackName =
    typeof metadataName === "string" ? metadataName.trim() : "";
  const userId = session?.user.id;
  const [profile, setProfile] = useState<CandidateProfile>({
    ...emptyCandidateProfile,
    fullName: fallbackName,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setErrorMessage("Your session is not available. Please log in again.");
      setIsLoading(false);
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(profileColumns)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setProfile(normalizeProfile(data, fallbackName));
    setIsLoading(false);
  }, [fallbackName, userId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile, requestVersion]);

  async function saveProfile(nextProfile: CandidateProfile) {
    if (!userId) {
      setErrorMessage("Your session is not available. Please log in again.");
      return false;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSaving(true);

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, ...profileToRow(nextProfile) },
        { onConflict: "id" },
      )
      .select(profileColumns)
      .single();

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return false;
    }

    setProfile(normalizeProfile(data, fallbackName));
    setSuccessMessage("Profile saved.");
    setIsSaving(false);
    return true;
  }

  return {
    errorMessage,
    isLoading,
    isSaving,
    profile,
    retry: () => setRequestVersion((version) => version + 1),
    saveProfile,
    successMessage,
  };
}
