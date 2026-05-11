# CaribAI Deployment Notes

## Current Public Site

The active front-facing CaribAI site is the static site at the repository root.

It includes:

- static HTML pages
- shared CSS and JavaScript
- JSON-driven site content
- a JSON-driven journal/blog
- local assets under `assets/`

## Vercel Deployment

This project is currently set up to deploy as a static Vercel site.

Relevant file:

- `vercel.json`

### Deploy Steps

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Keep the deployment as a static site.
4. Deploy.

## What The Public Site Depends On

### Core files

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

### Content files

- `content/site/`
- `content/blog/`

### Assets

- `assets/`

## Contact Form Note

The current contact flow still opens the local email client and targets:

- `caribailabs@gmail.com`

That is fine for now, but it can later be replaced with a proper form backend such as Formspree, Brevo, or a custom submission service.

## New Direction

The old Decap and Payload CMS layers have been removed.

The next CMS/admin direction should be built cleanly around the existing public site instead of reviving those earlier experiments.
