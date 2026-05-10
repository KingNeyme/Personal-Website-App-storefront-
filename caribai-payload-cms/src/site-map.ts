export const siteMap = {
  home: {
    label: 'Home',
    path: '/',
    global: 'home-page',
  },
  about: {
    label: 'About',
    path: '/about',
    global: 'about-page',
  },
  products: {
    label: 'Products',
    path: '/products',
    global: 'storefront-page',
  },
  projects: {
    label: 'Projects',
    path: '/projects',
    global: 'projects-page',
  },
  journey: {
    label: 'Journey',
    path: '/journey',
    global: 'journey-page',
  },
  journal: {
    label: 'Journal',
    path: '/journal',
    global: 'journal-page',
  },
  techStack: {
    label: 'Tech Stack',
    path: '/tech-stack',
    global: 'tech-stack-page',
  },
  certifications: {
    label: 'Certifications',
    path: '/certifications',
    global: 'certifications-page',
  },
  contact: {
    label: 'Contact',
    path: '/contact',
    global: 'contact-page',
  },
} as const

export const managedCollections = {
  posts: {
    label: 'Journal Posts',
    path: '/journal',
  },
  products: {
    label: 'Products',
    path: '/products',
  },
  projects: {
    label: 'Projects',
    path: '/projects',
  },
} as const
