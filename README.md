## CaribAI Project Structure

This repository now centers around three clear layers:

1. A new `Next.js` public-facing CaribAI site
2. A file-based custom CMS under `/cms`
3. A separate internal product factory under `/caribai-product-engine`

The old static public-site renderer is being retired in favor of the new React/Next public app so the brand layer can reach a higher design and UX ceiling.

## Active Parts Of The Repo

### Public Brand Site

The current audience-facing site now lives in the Next app:

- `app/`
- `components/`
- `lib/`
- `app/globals.css`
- `package.json`
- `next.config.mjs`

The public app still reads the same JSON content model:

- `content/site/`
- `content/blog/`
- `assets/`

During build, those are synced into `public/` by:

- `scripts/sync-static.mjs`

### Custom CMS

The current editorial/admin layer remains under:

- `cms/`

It is still file-based for now and manages the same JSON content surfaces the public app consumes.

### Product Factory

The separate internal CaribAI Labs product factory remains under:

- `caribai-product-engine/`

This stays intentionally separate from the public site and CMS.

## Current Direction

The new direction is:

- premium React/Next public brand site
- existing file-based CMS kept working under `/cms`
- shared JSON content model preserved
- internal product engine kept separate

That gives CaribAI a cleaner frontend ceiling without forcing a full CMS/backend rewrite at the same time.

## Deployment

Current live/public base:

- `https://caribailabs.vercel.app`

Current CMS path:

- `https://caribailabs.vercel.app/cms/`

See:

- `DEPLOYMENT.md`
