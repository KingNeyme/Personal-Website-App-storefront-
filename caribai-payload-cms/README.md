# CaribAI Payload CMS

This is the new long-term CMS foundation for CaribAI.

It is intentionally being built **next to** the current live static site so we can migrate safely without breaking production.

## What this scaffold includes

- Payload config with SQLite for an easy local starting point
- Core admin collections:
  - `users`
  - `media`
  - `posts`
  - `products`
  - `projects`
- Core globals:
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
- A seed-generation script that maps the current static JSON content into a Payload-friendly import shape
- A media-manifest generator that audits the current local and remote assets used by the live site

## Why this direction

Decap helped prove the editing flow, but CaribAI now needs a real admin foundation:

- stronger media management
- a more serious editorial workspace
- real users and permissions
- easier long-term growth into apps, internal tools, and operations

## First safe migration path

1. Keep the live static site running.
2. Finish the Payload content model here.
3. Generate and import seed data from the current JSON content.
4. Audit and reconcile media into the Payload media library.
5. Rebuild the public frontend against Payload APIs / local API.
5. Cut over only when the new stack is fully ready.

## Local next steps

1. Copy `.env.example` to `.env`
2. Install dependencies
3. Run `npm run generate:seed`
4. Run `npm run generate:media-manifest`
5. Run `npm run import:seed`
6. Run `npm run dev`

## Notes

- This first pass models the business foundation and content architecture.
- The new model now includes shell-level controls like primary navigation, footer columns, and the default header CTA.
- The journal has its own page-level global so the public editorial layer can be managed as intentionally as the rest of the brand.
- The public site frontend migration is a separate step from the admin/data foundation.
- Some page globals still use structured JSON fields as transitional storage so we can move faster from the current site shape into Payload without losing information.
