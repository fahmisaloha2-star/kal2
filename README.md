# 2M ARCHI — Monorepo

Local-first, production-shaped stack for the 2M ARCHI website.

```
.
├── front/   Public site (Vite + React 18 + TS + Tailwind v4) — port 5173
├── back/    Express API (TypeScript)                          — port 3001
└── admin/   Admin dashboard                                   — port 4000  (planned)
```

## Run locally

```bash
npm run install:all   # installs back + front
npm run dev           # runs back (3001) + front (5173) together
```

The seed runs automatically the first time the API starts (creates `back/data/db.json`).
To reseed manually: `npm run seed`.

## Environment

Each app reads its config from `.env.local` (dev) / `.env.production` (prod). No URL is
hardcoded — the front reads `VITE_API_URL`. Copy the `.env.example` files and fill in real
values (SMTP credentials, `ADMIN_PASSWORD`, `JWT_SECRET`, `PUBLIC_URL`). The `.env.local`
and `.env.production` files are git-ignored.

## Status

- ✅ **Backend** — JSON DB + auto-seed, JWT auth, CRUD + reorder, image upload (sharp →
  WebP + thumbnail), contact email (Nodemailer + honeypot), dynamic sitemap/robots,
  helmet + rate limiting.
- ✅ **Public site** — reads from the API with graceful offline fallback to default data,
  project detail modal, full SEO/OG/GA4/JSON-LD, accessibility, additive animations. The
  embedded admin and the ⚙ icon have been removed.
- 🔜 **Admin dashboard** (`admin/`) and deployment files (PM2 / nginx / DEPLOY.md) — next pass.

## Build

```bash
npm run build:all     # builds front (dist/) and back (dist/)
```
