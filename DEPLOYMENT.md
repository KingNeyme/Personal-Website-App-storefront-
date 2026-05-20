# CaribAI Deployment Notes

## Current Public Site

The active public CaribAI site is now the `Next.js` app in this repository.

It depends on:

- `app/`
- `components/`
- `lib/`
- `app/globals.css`
- `content/site/`
- `content/blog/`
- `assets/`
- `scripts/sync-static.mjs`

The CMS remains a static/file-based editorial layer under:

- `cms/`

## Vercel Deployment

Current live URL:

- `https://caribailabs.vercel.app`

CMS URL:

- `https://caribailabs.vercel.app/cms/`

Relevant files:

- `vercel.json`
- `package.json`
- `next.config.mjs`

## Deploy Steps

1. Push the repository to GitHub.
2. Connect the repository to Vercel.
3. Let Vercel run `npm install` and `npm run build`.
4. The build will sync `assets`, `content`, and `cms` into `public/` automatically.
5. Deploy.

## CMS Entry Point

The custom admin lives at:

- `/cms/`

and the current shell is:

- `/cms/app/`

## Contact Flow Note

The public-site lead and contact forms currently open the user’s email client and target:

- `caribailabs@gmail.com`

That is acceptable for now, but later can be replaced with:

- Formspree
- Resend
- a custom API route
- another submission backend

## Current Goal

The repo is now being shaped around:

- a higher-ceiling React/Next public site
- a controlled file-based CMS
- a separate internal product factory
