import { useState } from "react";
import { useLoginOAuth, useLoginOTP } from "@/hooks/profile/useLogin";
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
  const { mutate: loginOTP, isPending: isLoginOTPPending } = useLoginOTP();
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
    loginOTP({ email });
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
        isLoading={isLoginPending || isLoginOTPPending}
        showSocialLogins={true}
        socialLoginHandlers={socialLoginHandlers}
      />
    </div>
  );
}
