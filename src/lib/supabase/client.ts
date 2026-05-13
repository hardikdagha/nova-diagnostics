import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser/client-side Supabase client (anon key + RLS enforced)
// Types are available via @/lib/supabase/types for explicit casting where needed
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
