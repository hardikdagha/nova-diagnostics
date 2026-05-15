# Supabase Edge Functions

All four functions are Deno-based, deployed on Supabase Edge Runtime with `verify_jwt: false` (each function enforces its own auth where required).

## Functions

| Function | Auth required | Called from | Purpose |
|---|---|---|---|
| `verify-report-token` | None | Patient report link `/r/[token]` | Verifies secure download token, returns signed URL |
| `fallback-report-lookup` | Patient session (optional) | Patient report page `/reports` + patient dashboard | Lookup by report number + mobile, rate-limited |
| `send-report-email` | Staff session | Admin portal `/admin/reports` | Emails report download link to patient via Resend |
| `send-home-collection-email` | Staff session | Admin portal `/admin/home-collections` | Emails confirmed appointment details to patient via Resend |

## Required Secrets (set in Supabase Dashboard → Settings → Edge Functions)

| Secret | Used by |
|---|---|
| `SUPABASE_URL` | All functions (auto-provided by Supabase) |
| `SUPABASE_SERVICE_ROLE_KEY` | All functions (auto-provided by Supabase) |
| `RESEND_API_KEY` | `send-report-email`, `send-home-collection-email` |

## Deploy

```bash
# Deploy all functions
supabase functions deploy verify-report-token --no-verify-jwt
supabase functions deploy fallback-report-lookup --no-verify-jwt
supabase functions deploy send-report-email --no-verify-jwt
supabase functions deploy send-home-collection-email --no-verify-jwt
```

Or via the Supabase Dashboard → Edge Functions → Deploy from GitHub.

## CORS Policy

All functions restrict `Access-Control-Allow-Origin` to known origins with `Vary: Origin`:
- `https://www.novadiagnosticslab.com`
- `https://novadiagnosticslab.com`
- `http://localhost:3000` (verify-report-token and admin functions only)

`fallback-report-lookup` does not allow localhost (patient-facing, production only).
