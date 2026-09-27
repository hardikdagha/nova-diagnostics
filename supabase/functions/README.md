# Supabase Edge Functions

All functions are Deno-based and deployed on Supabase Edge Runtime. Staff email functions enforce an active `staff_users` record in the handler; configure them with `verify_jwt: false` to match the existing deployment pattern.

## Functions

| Function | Auth required | Called from | Purpose |
|---|---|---|---|
| `verify-report-token` | None | Patient report link `/r/[token]` | Verifies secure download token, returns signed URL |
| `fallback-report-lookup` | Patient session (optional) | Patient report page `/reports` + patient dashboard | Lookup by report number + mobile, rate-limited |
| `send-report-email` | Staff session | Admin portal `/admin/reports` | Emails report download link to patient via Resend |
| `send-home-collection-email` | Staff session | Admin portal `/admin/home-collections` | Emails confirmed appointment details to patient via Resend |
| `send-staff-email` | Active staff session | Admin portal composer and request panels | Sends staff-authored plain-text email from the fixed Nova Diagnostics sender via Resend |

## Required Secrets (set in Supabase Dashboard → Settings → Edge Functions)

| Secret | Used by |
|---|---|
| `SUPABASE_URL` | All functions (auto-provided by Supabase) |
| `SUPABASE_SERVICE_ROLE_KEY` | All functions (auto-provided by Supabase) |
| `RESEND_API_KEY` | `send-report-email`, `send-home-collection-email`, `send-staff-email` |

## Deploy

```bash
# Deploy all functions
supabase functions deploy verify-report-token --no-verify-jwt
supabase functions deploy fallback-report-lookup --no-verify-jwt
supabase functions deploy send-report-email --no-verify-jwt
supabase functions deploy send-home-collection-email --no-verify-jwt
supabase functions deploy send-staff-email --no-verify-jwt
```

Or via the Supabase Dashboard → Edge Functions → Deploy from GitHub.

## CORS Policy

All functions restrict `Access-Control-Allow-Origin` to known origins with `Vary: Origin`:
- `https://www.novadiagnosticslab.com`
- `https://novadiagnosticslab.com`
- `http://localhost:3000` (verify-report-token and admin functions only)

`fallback-report-lookup` does not allow localhost (patient-facing, production only).

`send-staff-email` accepts one recipient, a subject, and a plain-text message (maximum 12,000 characters). It fixes the sender to `Nova Diagnostics <contact@novadiagnosticslab.com>`, does not accept attachments, and does not store or log message content. It independently verifies the Supabase access token and active staff membership before calling Resend. It reuses the existing `RESEND_API_KEY` secret; the verified sender/domain must already be enabled in Resend.
