import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Patient portal Supabase browser client.
 *
 * Uses a dedicated storageKey ("nova-patient-auth") so the patient session lives
 * in its own localStorage entry, completely isolated from the staff session.
 *
 * Signing in or out via this client does NOT touch "nova-staff-auth", and vice
 * versa. The two portals can be open in the same browser without interfering.
 *
 * All /patient pages and /auth/callback must import from this module, NOT from
 * the shared @/lib/supabase/client.
 */
export const patientSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "nova-patient-auth",
    persistSession: true,
    autoRefreshToken: true,
  },
});
