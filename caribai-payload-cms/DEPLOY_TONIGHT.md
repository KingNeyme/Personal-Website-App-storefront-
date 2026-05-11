# Deploy CaribAI Permanently

This Payload app is now aimed at the permanent CaribAI stack:

- Vercel for the frontend / app runtime
- Payload for admin and content operations
- Postgres for the production database

The SQLite path remains only as a local fallback while Postgres is being provisioned.

## Recommended permanent stack

### Vercel + Payload + Postgres
Use this if the goal is the real long-term CaribAI platform.

Why:
- Payload runs well in a Next.js deployment model
- Vercel is strong for the frontend and app hosting layer
- Postgres is the right production database for a serious CMS/business platform
- this avoids building permanent infrastructure around SQLite

## Database note

As of July 22, 2025, Vercel no longer provisions a first-party "Vercel Postgres" database. Vercel now connects Postgres through Marketplace providers such as Neon. The app is therefore configured to work with standard Postgres connection strings through:

- `DATABASE_URL`
- `POSTGRES_URL`

## How the app now behaves

- If `DATABASE_URL` or `POSTGRES_URL` is present, Payload uses Postgres
- If neither is present, Payload falls back to local SQLite for development only

## Required env vars

- `PAYLOAD_SECRET`
- `DATABASE_URL` or `POSTGRES_URL`
- `NEXT_PUBLIC_SITE_URL`
- `PORT` (optional, defaults to `3000`)
- `HOSTNAME` (recommended as `0.0.0.0` in hosted environments)

## Vercel setup

1. Push `caribai-payload-cms` to GitHub.
2. Create a Vercel project using `caribai-payload-cms` as the root directory.
3. Add a Postgres provider from the Vercel Marketplace, or provision Neon manually.
4. Ensure Vercel injects either:
   - `POSTGRES_URL`
   - or `DATABASE_URL`
5. Add:
   - `PAYLOAD_SECRET`
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
   - `HOSTNAME=0.0.0.0`
6. Run the migration explicitly against Postgres before or right after the first deploy:

```bash
DATABASE_URL=postgres://... npm run migrate
```

7. Deploy.
8. After the database connection is live, import the baseline content:

```bash
DATABASE_URL=postgres://... npm run import:seed
```

This seeds:
- site settings
- homepage
- about
- journal page
- storefront page
- projects page
- journey
- tech stack
- certifications
- contact
- posts
- products
- projects

## Why migrations are separate

The Vercel build now runs only:

```bash
npm run build
```

and the database migration is run separately with:

```bash
npm run migrate
```

This avoids deployment failures caused by a database migration step blocking or failing inside the Vercel build pipeline.

## Health check

Use:

- `/api/health`

Expected response:

```json
{
  "ok": true,
  "service": "caribai-payload-cms"
}
```

## Before deploying

1. Make sure the first admin user already exists locally or be ready to create it after first deploy.
2. Confirm your public pages render:
   - `/`
   - `/about`
   - `/products`
   - `/projects`
   - `/journal`
   - `/journey`
   - `/tech-stack`
   - `/certifications`
   - `/contact`
3. Decide whether tonight's deploy is:
   - a soft internal preview
   - or the real public CaribAI cutover

## Local production smoke test

Run:

```bash
npm run build
DATABASE_URL=postgres://... PORT=4011 HOSTNAME=127.0.0.1 npm run start
```

Then check:

- `http://127.0.0.1:4011/api/health`
- `http://127.0.0.1:4011/admin`
