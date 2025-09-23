import { useState } from "react";
import { useLoginOAuth } from "@/hooks/profile/useLogin";
import { AuthForm, type AuthFormField } from "./auth-form";

interface LoginFormProps extends React.ComponentProps<"div"> {
  onSwitchForm?: () => void;
}

export function LoginForm({
  className,
  onSwitchForm,
  ...props
}: LoginFormProps) {
  const { mutate: login, isPending: isLoginPending } = useLoginOAuth();
  const [email, setEmail] = useState("");

  const fields: AuthFormField[] = [
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "m@example.com",
      required: true,
      value: email,
      onChange: setEmail,
    },
  ];

  const handleSubmit = () => {
    // For now, login with email or social
    login({ provider: "google" });
  };

  const socialLoginHandlers = {
    google: () => login({ provider: "google" }),
    apple: () => login({ provider: "apple" }),
  };

  return (
    <div className={className} {...props}>
      <AuthForm
        title="Welcome to Scopes"
        subtitle={{
          text: "Don't have an account?",
          linkText: "Sign up",
          onLinkClick: onSwitchForm,
        }}
        fields={fields}
        submitText="Login"
        onSubmit={handleSubmit}
        isLoading={isLoginPending}
        showSocialLogins={true}
        socialLoginHandlers={socialLoginHandlers}
      />
    </div>
  );
}
