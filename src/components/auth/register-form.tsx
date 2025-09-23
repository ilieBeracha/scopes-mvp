import { useState, type FormEvent } from "react";
import { useRegister } from "@/hooks/profile/useRegister";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterFormProps extends React.ComponentProps<"div"> {
  onSwitchForm?: () => void;
  onRegistrationSuccess?: () => void;
}

export function RegisterForm({
  className,
  onSwitchForm,
  onRegistrationSuccess,
  ...props
}: RegisterFormProps) {
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    register(
      { email, password, firstName, lastName },
      {
        onSuccess: () => {
          // Call the callback to show org creation form
          onRegistrationSuccess?.();
        },
      }
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchForm}
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-6">
            <div className="grid gap-4">
              <div className="flex flex-row gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isRegisterPending}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isRegisterPending}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isRegisterPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isRegisterPending}
                />
              </div>
            </div>

            <Button
              disabled={isRegisterPending}
              type="submit"
              className="inline-flex items-center bg-background/20 backdrop-blur-md border border-gray-200/50 shadow-lg dark:border-gray-700/50"
              size="sm"
            >
              {isRegisterPending ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
