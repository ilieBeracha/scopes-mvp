import { useState } from "react";
import { useLoginOAuth, useLoginPassword } from "@/hooks/profile/useLogin";
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
  const { mutate: loginPassword, isPending: isLoginPasswordPending } =
    useLoginPassword();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    {
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "Password",
      required: true,
      value: password,
      onChange: setPassword,
    },
  ];

  const handleSubmit = () => {
    // For now, login with email or social
    loginPassword({ email, password });
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
        isLoading={isLoginPending || isLoginPasswordPending}
        showSocialLogins={true}
        socialLoginHandlers={socialLoginHandlers}
      />
    </div>
  );
}
