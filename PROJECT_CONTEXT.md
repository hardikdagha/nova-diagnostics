# Nova Diagnostics — Project Context

> Living reference doc for future Claude/dev sessions. Read this first before touching anything.
> **Do not put passwords or secrets here** — those live in `SECRETS.md` (gitignored).

---

## What this is

The marketing site, patient portal, and staff/admin portal for **Nova Diagnostics Lab** — a diagnostic / pathology lab located at:

> Shop No. 27, Daffodils CHS, Plot No 1-1 & 1-2, Sector-14, Vashi, Navi Mumbai – 400703, Maharashtra, India
> Tel: +91 8433706778 / Call: +91 8898989096 · Email: contact@novadiagnosticslab.com

The lab has been run for 34+ years by **Chandresh Dagha** (MSc Microbiology). Consultant pathologist: **Dr. Sujeet N. Singh** (MBBS, DDR, AFIH, MBA — Reg No: 2003/05/2155).

The codebase is **Next.js 16 static-exported** and deployed on **Cloudflare Workers** with assets in R2/Workers Sites. Backend is **Supabase** (Postgres + Auth + Storage).

---

## Tech stack

| Layer | Tech | Version |
|---|---|---|
| Frontend framework | Next.js | 16.2.6 (App Router, static export `output: "export"`) |
| Runtime | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| Backend | Supabase (Postgres + Auth + Storage) | @supabase/supabase-js 2.105 |
| PDF processing | pdf-lib | 1.17.1 |
| Hosting | Cloudflare Workers + Workers Assets | wrangler |
| Repo | GitHub (public) | `github.com/hardikdagha/nova-diagnostics` |
| Domain | `novadiagnosticslab.com` |
| Worker URL | `nova-diagnostics.hardikcdagha.workers.dev` |

**Important**: This is **NOT the Next.js you're used to**. v16 has breaking changes from earlier versions — APIs, conventions, file structure may differ from training data. Check `node_modules/next/dist/docs/` before writing code.

---

## Build & deploy

```bash
# from main project root (not the worktree)
cd "/Volumes/Crucial X9/Projects/Nova Diagnostics"
npx next build          # outputs static site to /out
npx wrangler deploy     # pushes /out to Cloudflare Workers
```

**Wrangler config** (`wrangler.jsonc`):
```json
{
  "name": "nova-diagnostics",
  "compatibility_date": "2026-05-12",
  "main": "./worker.ts",
  "assets": { "directory": "./out" }
}
```

**Gotcha — caching**: If `wrangler deploy` says `No updated asset files to upload`, only the JS worker code was updated. To force re-upload of an asset (e.g. letterhead.png), make sure the file hash actually changed. Wrangler hashes-skips identical files.

**Gotcha — worktree vs main**: There's a Claude worktree at `.claude/worktrees/practical-diffie-a4a94e/` on its own branch (`claude/practical-diffie-a4a94e`). Code edits in this session went to the **main project directory**, not the worktree. Build/deploy must run from the main project (`/Volumes/Crucial X9/Projects/Nova Diagnostics`) for changes to ship.

---

## Folder layout (key paths)

```
src/
  app/
    (marketing)/          – public marketing pages (home, about, blog, tests, packages, contact, etc.)
    admin/                – staff portal (auth-gated)
      login/              – staff sign-in
      dashboard/
      reports/            – upload reports + view list + per-report detail
        upload/           – the Crystal Reports → Nova letterhead merge flow
      home-collections/   – manage home-collection requests
      prescription-requests/
      enquiries/          – contact form submissions
    r/                    – patient-facing report download (token-gated)
  components/
    forms/                – ContactForm, HomeCollectionForm, PrescriptionUploadForm
    layout/               – Footer, etc.
    people/               – DoctorCard, MedicalLeadership, TeamSection
    sections/             – HeroSection, CTASection
    admin/                – AdminLayoutShell
    ui/                   – BrandLogo, DisclaimerBox, SectionHeading
  config/
    site.ts               – CENTRAL config: contact info, doctors, service areas, popular tests
  lib/
    supabase/
      client.ts           – generic client
      staffClient.ts      – staff portal client (storageKey "nova-staff-auth")
      patientClient.ts    – patient portal client (storageKey "nova-patient-auth")
      types.ts            – DB row types
    pdf/
      applyLetterhead.ts  – Crystal Reports + Nova letterhead PDF compositor

public/
  assets/
    letterhead.png        – Nova letterhead overlay (1055×1491 px, RGBA)
  images/
    nova-logo.jpg
    nova-logo-cropped.webp
    nova-lab-hero.webp
    doctors/
      dr-chandresh-dagha.jpg
      dr-sujit-singh.jpg
```

---

## Supabase project

- **Project URL**: stored in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
- **Anon key**: stored in `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable, OK to expose to browser)
- **Site URL (Supabase dashboard)**: `https://novadiagnosticslab.com`
- **Redirect URLs allowlist**: `https://novadiagnosticslab.com/**`
- Service-role keys & db passwords → **`SECRETS.md`** (gitignored)

### Key tables

- `staff_users` — staff member registry (joined to `auth.users` by `user_id`). Roles: `staff`, `admin`. RLS uses `is_staff_or_admin()`.
- `patients` — patient registry (deduped by `normalized_mobile`).
- `reports` — uploaded test reports. Has `token` + `token_hash` for patient-facing share URLs.
- `contact_enquiries` — contact form submissions.
- `home_collection_requests` — home sample collection bookings.
- `prescription_requests` — prescription upload requests.

### RLS notes

- DELETE policies exist on `contact_enquiries`, `home_collection_requests`, `prescription_requests`, and `reports` — all gated by `is_staff_or_admin()`.
- Without a matching DELETE RLS policy, Supabase silently returns 0 rows affected (no error) → optimistic UI delete that "comes back on refresh". If this happens, check policies.
- Reports storage bucket is private. Patient access goes through a signed-URL flow keyed by the `token`.

### Staff portal auth quirks

- `signOut()` defaults to `scope: "global"` which kills sessions on **all devices**. Always pass `{ scope: "local" }` for single-device sign-out.
- Staff and patient portals use isolated `storageKey` values so both can be open in the same browser.

---

## Admin emails (delete-permission allowlist)

Three emails have delete privileges on reports, enquiries, home-collections, and prescription-requests. The list is hardcoded in each admin page as `ADMIN_EMAILS`:

- `hardikd@novadiagnosticslab.com`
- `daghac@novadiagnosticslab.com`
- `sujeetsingh@novadiagnosticslab.com`

All other staff get read/update access but no delete button. (Server-side RLS still enforces this via `is_staff_or_admin()`.)

Passwords → `SECRETS.md`.

---

## The Crystal Reports → Nova letterhead PDF merge

This is the trickiest part of the codebase. Lives in `src/lib/pdf/applyLetterhead.ts`.

### Problem context

The lab uses **Crystal Reports** desktop software to generate raw test reports. These PDFs already include:
- All test result content
- Doctor signature ink marks AND printed doctor names at the bottom

The website's `applyLetterhead.ts` overlays a Nova-branded letterhead onto these uploaded PDFs to produce a clean digital report. For physical printing, the lab uses pre-printed Nova letterhead paper, so Crystal Reports keeps its signatures — they can't be stripped server-side.

### The letterhead PNG (`/public/assets/letterhead.png`)

Source: `nova_ws.png` (1055×1491 px, RGBA). Manipulated with PIL so specific row ranges are transparent:

| Rows | A4 fraction | State | Purpose |
|---|---|---|---|
| 0–159 | 0–10.7 % | **Opaque** | Nova logo header — covers Crystal Reports' own header |
| 160–1292 | 10.7–86.7 % | **Transparent** | Crystal Reports body content + actual signature ink marks show through |
| 1293–1374 | 86.7–92.0 % | **Opaque** | Template's printed names (Chandresh Dagha / Dr. Sujeet N. Singh) and designations |
| 1375–1491 | 92.0–100 % | **Opaque** | Footer with address & contact info |

### The compositor (`applyLetterhead.ts`)

Three-layer composite per page:
1. **Layer 0**: Solid white rectangle covering full A4 (prevents transparency rendering as gray checkerboard in PDF viewers).
2. **Layer 1**: The uploaded Crystal Reports PDF, scaled to **maximum size that fits A4** while preserving aspect ratio (≈ 0.972× for Letter source, 1.0× for A4 source — near-lossless), then **top-aligned** (`drawY = OUT_H - drawH`, no upward shift).
3. **Layer 2**: The letterhead PNG painted at full A4 size on top.

The transparent zone reaches ~730pt from A4 top, which fully covers Crystal Reports' signature ink marks at ~703–728pt. The patient info box near the top of Crystal Reports content lands just below the opaque Nova header (~90pt from top), safely visible.

### Tuning the merge

If a future Crystal Reports template has a different layout and the signatures are mis-aligned:
- **Signatures cut at the bottom** → extend the transparent zone (`TRANSPARENT_END` in the PIL script) further down. Don't go past row ~1290 or you'll start eating the template's printed doctor names.
- **Patient info box cut at the top** → DO NOT add an upward shift to `drawY`. Instead, reduce the size of the opaque header zone in the letterhead PNG (decrease `TRANSPARENT_START` from 160 toward 140).
- **Quality looks blurry** → check that the scale calculation gives ≈ 0.97–1.0. Anything below 0.85 means the source PDF is being downscaled too much. Confirm A4 output and Letter/A4 source.

---

## Production URL configuration

In the Supabase dashboard:
- **Site URL** → `https://novadiagnosticslab.com`
- **Redirect URLs** → `https://novadiagnosticslab.com/**`

In Cloudflare:
- Worker is bound to the `novadiagnosticslab.com` custom domain.

---

## What was changed in the recent session (May 19, 2026)

1. **Multi-device login**: Changed `signOut()` to `signOut({ scope: "local" })` in `AdminLayoutShell.tsx` and `admin/login/page.tsx`. Previously a sign-out killed sessions on all devices.
2. **Idle auto-refresh**: All three request pages (`home-collections`, `prescription-requests`, `enquiries`) refresh every 60s only after 30s of mouse/keyboard/scroll inactivity.
3. **Mobile detail panel**: Added a full-screen overlay (`fixed inset-x-0 top-14 bottom-0 z-50 ... lg:hidden`) for tapped entries on phone — previously nothing happened on mobile.
4. **Inline delete + role-gated**: Each row in the four admin lists now has an inline trash icon, visible only to the three admin emails. DELETE RLS policies were added in Supabase to make actual deletes persist.
5. **Hero copy**: "Accurate diagnostics, handled with care." → "Accurate diagnostics, **committed to care**."
6. **Hero font size**: Reduced headline sizes (mobile 2.6→2.1rem; md 3→2.6rem; lg 3.25→2.875rem).
7. **Mobile logo tagline**: BrandLogo "Committed to Care!" tagline changed from `hidden sm:flex` to `flex` so it shows on phones.
8. **Dr. Sujit photo**: Added `/public/images/doctors/dr-sujit-singh.jpg`. Flipped `imageAvailable` flag in `site.ts` (and used `true as boolean` to keep TypeScript happy with the optional-bool comparison in DoctorCard).
9. **Letterhead overhaul**: Replaced `letterhead.png` with a transparency-tuned version of `nova_ws.png`. Rewrote `applyLetterhead.ts` to draw Crystal Reports at near-1:1 scale (was ~0.7×, blurry).

---

## Common pitfalls to remember

- **TypeScript with `satisfies`**: `[{ imageAvailable: true }, ...] satisfies DoctorProfile[]` will infer `imageAvailable` as literal `true`, which breaks `!== false` checks elsewhere. Use `imageAvailable: true as boolean` or remove the property.
- **Public assets cached aggressively**: Cloudflare may keep stale `letterhead.png`. If a visual fix isn't taking effect, force a fresh deploy by ensuring the file bytes actually changed.
- **Crystal Reports PDFs** are usually **Letter (612×792 pt)**, not A4. Always handle the size mismatch in compositor logic.
- **pdf-lib y-origin is bottom-left**. Easy to get drawY math backwards.
- **Public GitHub repo** — never commit `.env*`, `SECRETS.md`, or hard-coded credentials.
