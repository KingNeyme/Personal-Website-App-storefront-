## CMS Architecture

## Goal

Build a custom CaribAI admin that manages the current front-facing site without replacing the site itself.

## Recommended System Shape

### Public Site

The current root site remains the audience-facing frontend.

- static HTML pages
- `site-content.js`
- `blog.js`
- `content/site/*.json`
- `content/blog/posts.json`
- `assets/`

### Custom CMS

The new CMS should become a separate staff-facing system with its own UI and backend responsibilities.

Recommended shape:

- `cms/app/`
  Admin interface for staff
- `cms/api/`
  Content and media service layer
- `cms/schema/`
  Content shapes and validation rules

## Recommended Build Strategy

### Phase 1: CMS Mirrors Existing JSON

Start by building the CMS around the exact content model the site already uses.

That means:

- singleton page editors for each site page
- a post editor for the blog
- a media manager for site graphics, logos, and uploads

The first implementation should preserve the current public-site structure rather than forcing a full frontend rewrite.

### Phase 2: Introduce A Structured Backend

Move content authority from hand-edited JSON files to a real backend layer.

Recommended backend services:

- auth for staff login
- structured content storage
- media storage
- validation

### Phase 3: Transition The Public Site

Once the CMS is stable, the public site can begin consuming CMS-managed content directly instead of local JSON files.

This should happen page by page, not all at once.

## Recommended Admin Sections

### Dashboard

- site status
- recent updates
- quick edit links
- media alerts
- publishing shortcuts

### Pages

- home
- about
- projects
- storefront
- journey
- tech stack
- certifications
- contact

### Journal

- all posts
- create post
- featured post toggle
- categories

### Media

- brand logos
- graphics
- uploads
- tech stack logos

### Settings

- contact email
- CTA links
- shared labels
- social links later

## Separation Of Concerns

The CMS should not absorb the internal product factory.

Keep these layers separate:

- public brand site
- custom content/admin system
- internal product factory

## Suggested Technical Direction

For the custom CMS itself, the most practical path is:

- custom admin UI
- structured backend
- asset/media handling

The implementation can be finalized in the next phase, but the architecture should stay:

- brand site first
- custom editorial/admin layer second
- internal products separate
