import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";

export function useCvStatus() {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCv, setHasCv] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!session?.user.id) {
        if (active) setIsLoading(false);
        return;
      }
      const { count } = await supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("category", "cv");
      if (active) {
        setHasCv((count ?? 0) > 0);
        setIsLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [session?.user.id]);

  return { hasCv, isLoading };
}
