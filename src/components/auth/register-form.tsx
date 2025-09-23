import { useState } from "react";
import { AuthForm, type AuthFormField } from "./auth-form";
import { useRegister } from "@/hooks/profile/useRegister";

interface RegisterFormProps extends React.ComponentProps<"div"> {
  onSwitchForm?: () => void;
}

export function RegisterForm({
  className,
  onSwitchForm,
  ...props
}: RegisterFormProps) {
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      placeholder: "Create a strong password",
      required: true,
      value: password,
      onChange: setPassword,
    },
    {
      id: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Confirm your password",
      required: true,
      value: confirmPassword,
      onChange: setConfirmPassword,
    },
  ];

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    register({ email, password });
  };

  return (
    <div className={className} {...props}>
      <AuthForm
        title="Create Account"
        subtitle={{
          text: "Already have an account?",
          linkText: "Sign in",
          onLinkClick: onSwitchForm,
        }}
        fields={fields}
        submitText="Create Account"
        onSubmit={handleSubmit}
        isLoading={isRegisterPending}
        showSocialLogins={false}
      />
    </div>
  );
}
