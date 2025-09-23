import { useState, type FormEvent } from "react";
import { useCreateOrganization } from "@/hooks/organization/useCreateOrganization";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";

interface OrgCreationFormProps extends React.ComponentProps<"div"> {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OrgCreationForm({
  className,
  onComplete,
  onSkip,
  ...props
}: OrgCreationFormProps) {
  const { mutate: createOrganization, isPending: isCreating } =
    useCreateOrganization();
  const [organizationName, setOrganizationName] = useState("");
  const [inviteEmails, setInviteEmails] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!organizationName.trim()) {
      alert("Please enter an organization name");
      return;
    }

    // Parse email addresses from textarea
    const emailList = inviteEmails
      .split(/[,\n]/) // Split by comma or newline
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    createOrganization(
      {
        name: organizationName.trim(),
        inviteeEmails: emailList,
      },
      {
        onSuccess: () => {
          onComplete?.();
        },
      }
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center  gap-6",
        className
      )}
      {...props}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Create Your Organization
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Set up your workspace to get started with your team
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  type="text"
                  placeholder="Acme Inc."
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  disabled={isCreating}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="inviteEmails">Invite Members (Optional)</Label>
              <Textarea
                id="inviteEmails"
                placeholder="Enter email addresses separated by commas or new lines&#10;example@company.com, another@example.com"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                disabled={isCreating}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                You can invite team members now or later from settings
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button disabled={isCreating} type="submit" size="sm">
              Create Organization
            </Button>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="text-muted-foreground text-center text-xs text-balance">
        You can always create or join an organization later from your settings.
      </div>
    </div>
  );
}
