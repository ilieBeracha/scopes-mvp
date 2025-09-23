import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type RegisterInput = {
  email: string;
  password: string;
};

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: RegisterInput) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
