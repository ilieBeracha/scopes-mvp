import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Provider,
  Session,
  User,
  WeakPassword,
} from "@supabase/supabase-js";

export function useLoginOAuth() {
  const queryClient = useQueryClient();
  return useMutation<
    { provider: Provider; url: string },
    Error,
    { provider: Provider }
  >({
    mutationFn: async ({ provider }: { provider: Provider }) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,

        options: {
          redirectTo: import.meta.env.VITE_SUPABASE_AUTH_CALLBACK_URL,
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

export function useLoginPassword() {
  const queryClient = useQueryClient();
  return useMutation<
    { user: User; session: Session; weakPassword?: WeakPassword },
    Error,
    { email: string; password: string }
  >({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
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
