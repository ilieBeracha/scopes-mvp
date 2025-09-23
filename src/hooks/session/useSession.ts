import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useSession() {
  const queryClient = useQueryClient();

  const { data: response } = useQuery({
    queryKey: ["session"],
    queryFn: () => supabase.auth.getSession(),
    staleTime: 0, // Always refetch to get latest session state
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(["session"], { data: { session } });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return response?.data.session;
}

export function useUserMetadata() {
  const session = useSession();
  return session?.user.user_metadata;
}
