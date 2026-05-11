## CaribAI Project Structure

This repository is now organized around two active directions:

1. The front-facing CaribAI brand site
2. The separate CaribAI Labs product factory

The old Decap and Payload CMS experiments have been removed so the project matches the direction we actually want to build.

## Active Parts Of The Repo

### Public Brand Site

The current public site lives at the repository root and is deployed as a static site.

Core files:

- `index.html`
- `about.html`
- `projects.html`
- `storefront.html`
- `journey.html`
- `tech-stack.html`
- `certifications.html`
- `contact.html`
- `blog.html`
- `blog-post.html`
- `styles.css`
- `script.js`
- `site-content.js`
- `blog.js`

Content and assets:

- `content/site/`
- `content/blog/`
- `assets/`

### Product Factory

The internal CaribAI Labs product factory remains separate in:

- `caribai-product-engine/`

This is intentionally kept apart from the public site so the brand layer and internal product layer do not get tangled together.

### Future CMS

The future custom admin and content system now has a reserved home in:

- `cms/`

## Current Direction

The public site remains the same front-facing experience for:

- brand positioning
- storytelling
- projects
- certifications
- tech stack
- journey
- journal content
- storefront presentation

The next admin direction is a custom CaribAI-managed content system built around the existing public site, not the old Decap or Payload approach.

## What Was Removed

These previous CMS experiments are no longer part of the active project direction:

- Decap admin
- Payload CMS app

## Deployment

The current public site can still be deployed as a static Vercel project.

See:

- `DEPLOYMENT.md`
