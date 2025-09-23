import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router";

type RegisterInput = {
  email: string;
  password: string;
};

export function useRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({ email, password }: RegisterInput) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      navigate("/");
      return data;
    },
  });
}
