## CaribAI Custom CMS

This folder now contains the live custom CMS direction for the CaribAI front-facing site.

The goal is not to revive Decap or Payload. The goal is to run a clean, beautiful content manager around the site that already exists.

## What The CMS Manages

The current public site already has a stable content surface. The CMS now manages:

- homepage
- about
- projects
- storefront
- journey
- tech stack
- certifications
- contact
- blog posts
- shared media assets
- shared navigation, footer, and contact settings
- lightweight workflow status for pages, posts, and storefront offers

## Current Direction

The current CMS works as a file-based editorial layer:

- keep the current public site and its design
- build a custom admin in `cms/app/`
- edit the real JSON content sources already powering the public site
- support drafts, workflow states, preview links, JSON export, and save-to-file flows
- keep the future backend/API path open if the team later wants authentication or multi-user access

## Folder Plan

- `ARCHITECTURE.md`
  The system design for the custom CMS
- `CONTENT_MODEL.md`
  The editable surfaces and content schema
- `ROADMAP.md`
  The build sequence
- `STAFF_GUIDE.md`
  Day-to-day editing guidance for internal use
- `schema/`
  Content definitions and validators
- `app/`
  The current admin UI
- `api/`
  The future content/service layer if the CMS moves beyond file-based editing
- `storage/`
  Media and asset strategy notes

## Important Principle

This CMS should be built around the real CaribAI workflow:

- edit the brand site comfortably
- manage the storefront clearly
- publish blog content cleanly
- update projects and certifications quickly
- keep the internal product factory separate

## Current Working Surfaces

- `Pages`
  Singleton page editing for the 8 public brand pages
- `Journal`
  Create, edit, delete, preview, and manage post status
- `Storefront`
  Edit page sections, create offers, delete offers, and manage offer status
- `Media`
  Edit the real media registry and preview tracked assets
- `Settings`
  Edit shared site settings that control branding, navigation, footer, and contact routing

## Workflow States

The CMS uses a lightweight editorial workflow:

- `Draft`
- `Ready`
- `Live`

These states are stored directly in the content JSON so they persist through reset, export, and save-to-file actions.

## Validation

Run this before shipping a major content pass:

```bash
node cms/schema/validate-content.mjs
```

It checks:

- JSON parses cleanly
- workflow states are valid
- required post and storefront fields exist
- settings and media files keep the expected structure

## Important Limitation

This is currently a file-based CMS running on the static site. It is strong for controlled editing and front-end management, but it is not a secure multi-user backend yet.

That means:

- it is excellent for local editing and controlled internal use
- it is not a true authenticated server-backed CMS yet
- if the team later needs staff accounts, remote saves, or role-based access, the next step is building the planned API/backend layer

## Entry Path

The admin path convention is:

- public site: `/`
- CMS entry: `/cms/`
- CMS app shell: `/cms/app/`
