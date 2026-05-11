## CaribAI Custom CMS

This folder is the starting point for the next CaribAI admin and content system.

The goal is not to revive Decap or Payload. The goal is to build a clean custom CMS around the site that already exists.

## What The CMS Needs To Manage

The current public site already has a stable content surface. The CMS should manage:

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

## Recommended Direction

The cleanest direction is:

- keep the current public site and its design
- build a custom admin in `cms/app/`
- model the content in a structured backend
- support media uploads and staff-only access
- transition the public site from raw JSON editing to CMS-managed content gradually

## Folder Plan

- `ARCHITECTURE.md`
  The system design for the custom CMS
- `CONTENT_MODEL.md`
  The editable surfaces and content schema
- `ROADMAP.md`
  The build sequence
- `schema/`
  Content definitions and future validators
- `app/`
  The future admin UI
- `api/`
  The future content/service layer
- `storage/`
  Media and asset strategy notes

## Important Principle

This CMS should be built around the real CaribAI workflow:

- edit the brand site comfortably
- manage the storefront clearly
- publish blog content cleanly
- update projects and certifications quickly
- keep the internal product factory separate
