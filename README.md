# Nova Diagnostics Website

Modern marketing and booking website for Nova Diagnostics, a local pathology and diagnostic laboratory in Vashi, Navi Mumbai.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Edit Business Details

Update phone, WhatsApp, email, address, Google Maps URL, timings, NABL status and service areas in:

```text
src/config/site.ts
```

## Edit Tests and Packages

Test catalogue:

```text
src/data/tests.ts
```

Health packages:

```text
src/data/packages.ts
```

Blog posts:

```text
src/data/blog.ts
```

## Notes

- Form submissions are frontend placeholders and show a success message.
- Prescription upload is UI-only until secure backend storage is implemented.
- No patient login, report portal, LIMS, payment, AI diagnosis or doctor dashboard is included.
- Legal policy pages are starter templates and should be reviewed before launch.
