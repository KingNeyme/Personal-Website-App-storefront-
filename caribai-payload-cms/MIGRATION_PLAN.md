# CaribAI Payload Migration Plan

## Objective

Move CaribAI from a static site + Decap editing workflow into a real business-grade CMS and admin foundation powered by Payload.

## Recommended sequence

### Phase 1: Foundation

Already started in this folder:

- Payload app scaffold
- Core collections and globals
- Seed-generation script from current JSON content
- Media-manifest generation for the current asset footprint
- Draft/version support for the main editable entities

### Phase 2: Content import

1. Install dependencies inside `caribai-payload-cms`
2. Generate the seed file
3. Generate the media manifest
4. Create a first import script or one-time bootstrap script that writes:
   - site settings
   - globals
   - posts
   - products
   - projects
5. Upload or reconcile media

## Content architecture

### Collections

- `users`
- `media`
- `posts`
- `products`
- `projects`

### Globals

- `site-settings`
- `home-page`
- `about-page`
- `journal-page`
- `storefront-page`
- `projects-page`
- `journey-page`
- `tech-stack-page`
- `certifications-page`
- `contact-page`

## Media migration note

Current content still points to:

- local SVG assets in `/assets/graphics`
- some external URLs for stack logos
- shell assets like the current CaribAI logo and public-site graphics

During migration, decide which assets should:

- remain external temporarily
- move into the Payload media collection
- be replaced with higher-quality brand assets

## Frontend migration

Once the content model is stable:

1. Build a new frontend against Payload data
2. Recreate the current public pages in a Next.js app
3. Use Payload APIs or local API for rendering
4. Port over:
   - homepage
   - about
   - storefront
   - projects
   - journey
   - tech stack
   - certifications
   - contact
   - blog

## Admin direction

The long-term goal is:

- Payload admin as the real CMS
- custom editorial polish inside Payload where useful
- no more deep dependency on Decap

## Best next implementation task

Build a bootstrap import script that takes `src/seed/caribai-seed.json` and writes it into Payload automatically after the first local setup.
