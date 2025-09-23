import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export interface Organization {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface OrganizationMember {
  org_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
}

export interface UserOrganization extends Organization {
  member: OrganizationMember;
}

export function useOrganization() {
  return useQuery<UserOrganization | null>({
    queryKey: ["organization"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        return null;
      }

      const orgMetadata = session.user.user_metadata?.organization;
      if (orgMetadata) {
        return {
          id: orgMetadata.id,
          name: orgMetadata.name,
          created_by: session.user.id,
          created_at: orgMetadata.joined_at,
          member: {
            org_id: orgMetadata.id,
            user_id: session.user.id,
            role: orgMetadata.role,
            joined_at: orgMetadata.joined_at,
          },
        };
      }

      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (membershipError || !membership) {
        return null;
      }

      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", membership.org_id)
        .single();

      if (orgError || !organization) {
        return null;
      }

      return {
        ...organization,
        member: membership,
      };
    },
  });
}
