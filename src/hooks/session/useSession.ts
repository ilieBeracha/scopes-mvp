import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useSession() {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => supabase.auth.getSession(),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(["session"], { data: { session } });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return {
    session: response?.data.session,
    isLoading,
  };
}

export function useUserMetadata() {
  const { session } = useSession();
  return session?.user.user_metadata;
}
