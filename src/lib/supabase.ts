import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY is not set"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
