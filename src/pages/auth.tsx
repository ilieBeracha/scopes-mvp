import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { useState } from "react";
import { useNavigate } from "react-router";

export function AuthPage() {
  const [form, setForm] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const handleRegistrationSuccess = () => {
    setForm("login");
  };

  const handleLoginSuccess = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center min-h-[calc(100dvh-40px)]">
      {form === "login" && (
        <LoginForm
          onSwitchForm={() => setForm("register")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {form === "register" && (
        <RegisterForm
          onSwitchForm={() => setForm("login")}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
}
