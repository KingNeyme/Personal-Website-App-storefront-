## CaribAI CMS Staff Guide

## Entry Points

- public site: `https://caribailabs.vercel.app`
- CMS entry: `https://caribailabs.vercel.app/cms/`
- CMS shell: `https://caribailabs.vercel.app/cms/app/`

## What Each Area Controls

- `Pages`
  Main singleton pages like Home, About, Projects, Journey, Tech Stack, Certifications, and Contact
- `Journal`
  Blog-style publishing
- `Storefront`
  Visible offers and the storefront page structure
- `Media`
  Tracked brand logos, graphics, and tech-logo dependencies
- `Settings`
  Shared navigation, footer, brand, and contact controls

## Workflow States

- `Draft`
  Work in progress and not ready for wider attention
- `Ready`
  Reviewed and close to publish quality
- `Live`
  The content is approved for the current front-facing experience

## Daily Editing Flow

1. Open the relevant CMS section.
2. Select the page, post, or offer you want to edit.
3. Update the fields.
4. Set the content status to `Draft`, `Ready`, or `Live`.
5. Use `Preview` to check the public-facing result.
6. Use `Save draft` for temporary browser storage while working.
7. Use `Download JSON` or `Save to file` when you want to commit the source update.

## Important Notes

- `Save draft` stores the work in the browser, not in Git.
- `Save to file` works only in supported local browsers.
- This CMS is currently file-based, so shipping changes still depends on updating the actual JSON content files and deploying them.
- If browser drafts ever feel out of sync, use `Reset` to return to the current source file version.
