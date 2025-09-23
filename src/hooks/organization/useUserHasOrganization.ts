import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "../session/useSession";

export function useUserHasOrganization() {
  const { session } = useSession();

  return useQuery({
    queryKey: ["user-has-organization", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return false;
      }

      const { data, error } = await supabase.rpc("user_has_organization");

      if (error) {
        console.error("Error checking user organization:", error);
        return false;
      }

      return data as boolean;
    },
    enabled: !!session?.user?.id, // Only run when we have a session
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    initialData: undefined, // Explicitly set initial data to undefined to avoid flashing
    refetchOnMount: true, // Always refetch when component mounts
  });
}
