const CMS_ROUTES = {
  overview: {
    introTitle: "Editorial operations",
    introCopy: "Manage site content, publish journal updates, and move between editing and preview without leaving the workspace.",
    managerTitle: "Choose a workspace to begin.",
    managerCopy: "Use the shortcuts above to switch collections, then use the focused links here to move faster inside the CMS.",
    noteTitle: "Publishing should feel structured.",
    noteCopy: "Each collection here maps to a public-facing surface, so this workspace is designed to help you edit with clarity instead of guessing where content lives.",
    items: [
      {
        title: "Open the site page manager",
        description: "Jump into homepage, projects, storefront, journey, tech stack, certifications, and contact content.",
        actions: [
          { label: "Site content", href: "cms.html#/collections/site" },
          { label: "Preview homepage", href: "index.html" },
        ],
      },
      {
        title: "Open the journal workspace",
        description: "Create posts, manage images and cover media, and keep the editorial flow current.",
        actions: [
          { label: "Journal", href: "cms.html#/collections/blog" },
          { label: "Preview journal", href: "../blog.html" },
        ],
      },
    ],
    noteLinks: [
      { label: "Control center", href: "index.html" },
      { label: "View site", href: "../index.html" },
    ],
  },
  site: {
    introTitle: "Site operations",
    introCopy: "Edit homepage, products, journey, tech stack, certifications, and contact content from one structured publishing workspace.",
    managerTitle: "Page manager for the public site",
    managerCopy: "These shortcuts map the main public-facing surfaces so updates feel closer to a page builder or WordPress editor flow.",
    noteTitle: "Edit with page-level intent.",
    noteCopy: "The site collection controls the main CaribAI surfaces. Use the page shortcuts below, then preview the public site after larger edits.",
    items: [
      {
        title: "Homepage",
        description: "Hero, positioning, products, execution strategy, current focus, and conversion sections.",
        actions: [
          { label: "Edit homepage", href: "cms.html#/collections/site/entries/home" },
          { label: "View homepage", href: "../index.html" },
        ],
      },
      {
        title: "About and journey",
        description: "Identity, values, timeline, and the narrative that supports the broader CaribAI brand.",
        actions: [
          { label: "Edit about", href: "cms.html#/collections/site/entries/about" },
          { label: "Edit journey", href: "cms.html#/collections/site/entries/journey" },
        ],
      },
      {
        title: "Products and projects",
        description: "Storefront listings, project framing, and the public-facing portfolio of what CaribAI is building.",
        actions: [
          { label: "Edit products", href: "cms.html#/collections/site/entries/storefront" },
          { label: "Edit projects", href: "cms.html#/collections/site/entries/projects" },
        ],
      },
      {
        title: "Tech stack, certifications, contact",
        description: "Credibility surfaces, tooling, and the ways people understand or reach the brand.",
        actions: [
          { label: "Edit tech stack", href: "cms.html#/collections/site/entries/tech-stack" },
          { label: "Edit contact", href: "cms.html#/collections/site/entries/contact" },
        ],
      },
    ],
    noteLinks: [
      { label: "Preview homepage", href: "../index.html" },
      { label: "Preview products", href: "../storefront.html" },
      { label: "Back to control center", href: "index.html" },
    ],
  },
  blog: {
    introTitle: "Journal publishing",
    introCopy: "Create posts, upload cover media, and keep the public CaribAI editorial flow sharp without leaving the CMS workspace.",
    managerTitle: "Journal workflow",
    managerCopy: "Use this space like a compact publishing desk: write, attach media, review presentation, then preview the public journal.",
    noteTitle: "Think like a publication.",
    noteCopy: "Each post should strengthen the CaribAI narrative. Use media intentionally, keep excerpts sharp, and preview the public listing after updates.",
    items: [
      {
        title: "Create and refine posts",
        description: "Titles, excerpts, body content, featured state, and publication date all live in the blog collection.",
        actions: [
          { label: "Open journal", href: "cms.html#/collections/blog" },
          { label: "View journal", href: "../blog.html" },
        ],
      },
      {
        title: "Cover media and presentation",
        description: "Upload cover images or video so the public journal stays visually premium instead of text-only.",
        actions: [
          { label: "Manage media", href: "cms.html#/collections/blog" },
          { label: "Preview live", href: "../blog.html" },
        ],
      },
    ],
    noteLinks: [
      { label: "Preview journal", href: "../blog.html" },
      { label: "Back to control center", href: "index.html" },
    ],
  },
};

const renderManagerItems = (items = []) =>
  items
    .map(
      (item) => `
        <article class="cms-manager-item">
          <div class="cms-manager-item-copy">
            <strong>${item.title}</strong>
            <span>${item.description}</span>
          </div>
          <div class="cms-manager-item-actions">
            ${item.actions
              .map(
                (action) => `<a class="cms-mini-link" href="${action.href}"${action.href.startsWith("../") ? ' target="_blank" rel="noreferrer"' : ""}>${action.label}</a>`,
              )
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");

const renderNoteLinks = (links = []) =>
  links
    .map(
      (link) => `<a class="cms-mini-link" href="${link.href}"${link.href.startsWith("../") ? ' target="_blank" rel="noreferrer"' : ""}>${link.label}</a>`,
    )
    .join("");

const applyDecapTheme = () => {
  document.body.classList.add("caribai-decap-theme");

  const title = document.querySelector("title");
  if (title) {
    title.textContent = "CaribAI CMS Workspace";
  }

  document.querySelectorAll("button, [role='button']").forEach((element) => {
    element.classList.add("caribai-theme-button");
  });

  document.querySelectorAll("input, textarea, select").forEach((element) => {
    element.classList.add("caribai-theme-field");
  });

  const hash = window.location.hash || "#/";
  const route = hash.includes("/collections/blog")
    ? "blog"
    : hash.includes("/collections/site")
      ? "site"
      : "overview";

  document.querySelectorAll("[data-cms-route]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.cmsRoute === route);
  });

  const introTitle = document.querySelector(".cms-intro h1");
  const introCopy = document.querySelector(".cms-intro p");
  const managerTitle = document.querySelector("[data-cms-manager-title]");
  const managerCopy = document.querySelector("[data-cms-manager-copy]");
  const managerList = document.querySelector("[data-cms-manager-list]");
  const noteTitle = document.querySelector("[data-cms-note-title]");
  const noteCopy = document.querySelector("[data-cms-note-copy]");
  const noteLinks = document.querySelector("[data-cms-note-links]");
  const view = CMS_ROUTES[route] || CMS_ROUTES.overview;

  if (!introTitle || !introCopy || !managerTitle || !managerCopy || !managerList || !noteTitle || !noteCopy || !noteLinks) {
    return;
  }

  introTitle.textContent = view.introTitle;
  introCopy.textContent = view.introCopy;
  managerTitle.textContent = view.managerTitle;
  managerCopy.textContent = view.managerCopy;
  noteTitle.textContent = view.noteTitle;
  noteCopy.textContent = view.noteCopy;
  managerList.innerHTML = renderManagerItems(view.items);
  noteLinks.innerHTML = renderNoteLinks(view.noteLinks);
};

const observer = new MutationObserver(() => {
  applyDecapTheme();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyDecapTheme);
} else {
  applyDecapTheme();
}

window.addEventListener("hashchange", applyDecapTheme);
