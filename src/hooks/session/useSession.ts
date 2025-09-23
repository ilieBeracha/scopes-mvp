import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export function useSession() {
  const { data: response } = useQuery({
    queryKey: ["session"],
    queryFn: () => supabase.auth.getSession(),
  });
  return response?.data.session;
}
4;
4;
