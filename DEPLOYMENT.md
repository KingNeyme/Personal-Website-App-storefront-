# CaribAI Deployment Notes

## Vercel

This site is ready to deploy as a static project on Vercel.

### What is already prepared

- Static HTML, CSS, and JavaScript pages
- A content-driven blog
- A Decap CMS admin at `/admin`
- Vercel configuration in `vercel.json`

### Deploy steps

1. Push the current repo to GitHub.
2. Create a new Vercel project and import this repository.
3. Keep the project as a static site.
4. Deploy.
5. After deploy, update:
   - `admin/config.yml`
   - `site_url`
   - `display_url`
   with your real Vercel URL or custom domain.

## Decap CMS on Vercel

The content model is ready, but the GitHub backend needs an authentication helper for live login.

### Important

Decap's GitHub backend requires a server for authentication. Netlify provides this directly for Netlify-hosted sites, but for Vercel you need an external OAuth helper or proxy.

### In practice

For a live Vercel + Decap setup, you still need:

1. A GitHub OAuth app
2. An OAuth proxy/helper URL
3. That proxy URL added to `admin/config.yml` as `base_url`

### Current content setup

Blog content lives in:

- `content/blog/posts.json`

The public blog pages are:

- `blog.html`
- `blog-post.html`

The admin UI is:

- `admin/index.html`

## Short-term publishing options

### Option 1

Deploy the site to Vercel first, then finish the Decap auth step after the public site is live.

### Option 2

If you want the easiest built-in Decap authentication path immediately, host the site on Netlify instead of Vercel.

## Temporary note

Form handling currently opens the local email client using:

- `caribailabs@gmail.com`

This is enough for a first launch, but you can later replace it with Formspree, Brevo, or your own backend.
