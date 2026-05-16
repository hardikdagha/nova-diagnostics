import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Staff/admin Supabase browser client.
 *
 * Uses a dedicated storageKey ("nova-staff-auth") so the staff session lives in
 * its own localStorage entry, completely isolated from the patient session.
 *
 * Signing in or out via this client does NOT touch "nova-patient-auth", and vice
 * versa. The two portals can be open in the same browser without interfering.
 *
 * All /admin pages and AdminLayoutShell must import from this module, NOT from
 * the shared @/lib/supabase/client.
 */
export const staffSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "nova-staff-auth",
    persistSession: true,
    autoRefreshToken: true,
  },
});
