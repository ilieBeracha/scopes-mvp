import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      firstName,
      lastName,
    }: RegisterInput) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
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
