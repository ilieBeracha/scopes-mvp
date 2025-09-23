import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface CreateOrganizationInput {
  name: string;
  inviteeEmails?: string[];
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      inviteeEmails = [],
    }: CreateOrganizationInput) => {
      // Call the create_organization function
      const { data: organization, error } = await supabase.rpc(
        "create_organization",
        {
          p_name: name,
        }
      );

      if (error) throw error;

      // If we have invitees, create invitations
      if (inviteeEmails.length > 0) {
        const invitations = inviteeEmails.map((email) => ({
          email: email,
          org_id: organization.id,
          role: "member" as const,
        }));

        // Use the invite_user function for each email
        const invitePromises = invitations.map((invitation) =>
          supabase.rpc("invite_user", {
            p_email: invitation.email,
            p_org: organization.id,
            p_role: invitation.role,
          })
        );

        const inviteResults = await Promise.allSettled(invitePromises);

        // Log any failures but don't fail the org creation
        inviteResults.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(
              `Failed to invite ${invitations[index].email}:`,
              result.reason
            );
          }
        });
      }

      return organization;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      console.error("Failed to create organization:", error);
    },
  });
}
