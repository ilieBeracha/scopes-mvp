import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import type { Provider } from "@supabase/supabase-js";

export function useLoginOAuth() {
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
  });
}

export function useLoginOTP() {
  return useMutation<
    { user: null; session: null; messageId?: string | null },
    Error,
    { email: string; options?: { shouldCreateUser?: boolean } }
  >({
    mutationFn: async ({
      email,
      options,
    }: {
      email: string;
      options?: { shouldCreateUser?: boolean };
    }) => {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options,
      });
      if (error) throw error;
      return data;
    },
  });
}
