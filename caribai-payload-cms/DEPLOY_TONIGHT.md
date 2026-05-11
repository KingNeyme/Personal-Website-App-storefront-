# Deploy CaribAI Tonight

This Payload app can be hosted tonight, but the right host depends on the database choice.

## Fastest path tonight

### Option A: Railway with the current SQLite setup
Use this if the goal is to get the new Payload-powered CaribAI app online quickly with minimal rework.

Why:
- the app already runs on SQLite locally
- Railway supports deploying containerized apps
- Railway supports persistent volumes, which matters for SQLite-backed apps

What to configure:
- deploy the repo or the `caribai-payload-cms` directory as a service
- use the included `Dockerfile`
- set `PAYLOAD_SECRET`
- keep `DATABASE_URI=file:./caribai.db`
- attach a persistent volume so the SQLite file survives restarts

## Better long-term path

### Option B: Vercel + Postgres
Use this if the goal is the cleanest long-term frontend/platform architecture.

Why:
- Payload can run anywhere Next.js runs
- Vercel is strong for the Next.js side
- Postgres is a better long-term production database than SQLite for a serious business app

What changes are needed:
- replace `@payloadcms/db-sqlite` with a Postgres adapter
- switch the DB config in `payload.config.ts`
- provide a real Postgres connection string
- choose a Postgres provider such as Vercel Postgres / Neon / Railway Postgres

## Recommended decision

If you need the app live tonight:
- deploy **Railway first**
- keep SQLite temporarily
- move to **Postgres** after launch hardening

If you want the most future-proof production shape:
- migrate to **Postgres** before public cutover
- deploy the app on **Vercel** after the DB switch

## Required env vars

- `PAYLOAD_SECRET`
- `DATABASE_URI`
- `NEXT_PUBLIC_SITE_URL`
- `PORT` (optional, defaults to `3000`)

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

## Fastest Railway setup

1. Push `caribai-payload-cms` to GitHub.
2. Create a new Railway service from the repo.
3. Set the service root directory to `caribai-payload-cms`.
4. Let Railway build from the included `Dockerfile`.
5. Add environment variables:
   - `PAYLOAD_SECRET`
   - `DATABASE_URI=file:./caribai.db`
   - `NEXT_PUBLIC_SITE_URL=https://your-railway-domain.up.railway.app`
   - `PORT=3000`
   - `HOSTNAME=0.0.0.0`
6. Attach a persistent volume so `caribai.db` survives restarts.
7. After deploy, check:
   - `/api/health`
   - `/admin`
   - `/`

## Local production smoke test

Run:

```bash
npm run build
PORT=4011 HOSTNAME=127.0.0.1 npm run start
```

Then check:

- `http://127.0.0.1:4011/api/health`
- `http://127.0.0.1:4011/admin`

## Recommended tonight workflow

1. Deploy the Payload app as an internal preview first.
2. Confirm admin login, media upload, and page rendering.
3. Then point your public domain after the preview feels stable.
