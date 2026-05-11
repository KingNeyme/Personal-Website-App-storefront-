## Current Editable Surfaces

The existing public site already defines the first version of the CMS content model.

## Singleton Pages

These are single documents, not repeatable collections.

### Home

Source today:

- `content/site/home.json`

Main sections:

- hero
- positioning
- structure
- storefront
- build
- business model
- execution
- lens
- growth hub

### About

Source today:

- `content/site/about.json`

Main sections:

- hero
- identity
- values
- structure
- cta

### Projects

Source today:

- `content/site/projects.json`

Main sections:

- hero
- pipeline
- summary
- cta

### Storefront

Source today:

- `content/site/storefront.json`

Main sections:

- hero
- products
- summary
- lead
- cta

### Journey

Source today:

- `content/site/journey.json`

Main sections:

- hero
- focus
- documentation
- future
- cta

### Tech Stack

Source today:

- `content/site/tech-stack.json`

Main sections:

- hero
- primary
- secondary
- support
- cta

### Certifications

Source today:

- `content/site/certifications.json`

Main sections:

- hero
- status
- summary
- cta

### Contact

Source today:

- `content/site/contact.json`

Main sections:

- hero
- info
- form

## Repeatable Collections

### Blog Posts

Source today:

- `content/blog/posts.json`

Fields already in use:

- title
- slug
- publishDate
- category
- featured
- coverImage
- coverVideo
- excerpt
- body

### Shared Repeating Objects Across Pages

The CMS should support repeatable section items such as:

- product cards
- project pipeline cards
- hero metrics
- value cards
- summary cards
- CTA blocks
- tech stack tools

## Media Types

The current site uses:

- local graphics under `assets/graphics/`
- uploaded assets under `assets/uploads/`
- logos from remote URLs
- brand logos in `assets/`

The CMS should eventually normalize these into a cleaner media workflow.

## Future Normalized CMS Model

### Singletons

- site home
- site about
- site projects
- site storefront
- site journey
- site tech stack
- site certifications
- site contact
- site settings

### Collections

- posts
- media
- product entries
- project entries
- tech stack tools

The exact split between page-embedded arrays and global collections can be refined later, but this is the right starting model.
