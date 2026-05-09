const actions = Array.from(document.querySelectorAll("[data-admin-target]"));
const frame = document.querySelector("[data-admin-frame]");
const frameLabel = document.querySelector("[data-admin-frame-label]");
const workspaceTitle = document.querySelector("[data-admin-title]");
const workspaceCopy = document.querySelector("[data-admin-copy]");

const ADMIN_VIEWS = {
  overview: {
    title: "CaribAI control center",
    copy: "Manage the public-facing site, publish updates, and keep the CaribAI brand polished from one premium editorial workspace.",
    label: "Overview",
    target: "cms.html#/",
  },
  site: {
    title: "Site content",
    copy: "Update homepage, about, projects, storefront, journey, tech stack, certifications, and contact content without touching code.",
    label: "Site content collection",
    target: "cms.html#/collections/site",
  },
  blog: {
    title: "Journal publishing",
    copy: "Create and refine blog posts, upload cover media, and manage the public CaribAI journal flow from the same workspace.",
    label: "Blog collection",
    target: "cms.html#/collections/blog",
  },
  preview_home: {
    title: "Homepage preview",
    copy: "Review the live homepage composition, premium shell, and public-facing narrative without leaving the control center.",
    label: "Live homepage preview",
    target: "../index.html",
  },
  preview_products: {
    title: "Products preview",
    copy: "Inspect the storefront presentation, card composition, and product positioning in the public experience.",
    label: "Live products preview",
    target: "../storefront.html",
  },
  preview_journal: {
    title: "Journal preview",
    copy: "Review the public journal experience, post listing flow, and editorial presentation from inside the admin workspace.",
    label: "Live journal preview",
    target: "../blog.html",
  },
  full: {
    title: "Full CMS workspace",
    copy: "Open the raw Decap CMS interface directly when you want the full editor, workflow states, and native collection navigation.",
    label: "Decap CMS workspace",
    target: "cms.html#/",
  },
};

const setView = (key) => {
  const view = ADMIN_VIEWS[key] || ADMIN_VIEWS.overview;
  actions.forEach((action) => {
    action.classList.toggle("is-active", action.dataset.adminView === key);
  });

  if (workspaceTitle) workspaceTitle.textContent = view.title;
  if (workspaceCopy) workspaceCopy.textContent = view.copy;
  if (frameLabel) frameLabel.textContent = view.label;
  if (frame) frame.src = view.target;
};

actions.forEach((action) => {
  action.addEventListener("click", () => {
    setView(action.dataset.adminView || "overview");
  });
});

setView("overview");
