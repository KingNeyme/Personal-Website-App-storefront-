const workspaceAccessStorageKey = "caribai-cms-access";
const workspaceSessionMaxAgeMs = 1000 * 60 * 60 * 12;

const clearWorkspaceAccess = () => {
  sessionStorage.removeItem(workspaceAccessStorageKey);
};

const workspaceAccess = (() => {
  try {
    const value = JSON.parse(sessionStorage.getItem(workspaceAccessStorageKey) || "null");
    if (!value?.email) {
      return null;
    }

    const accessedAt = new Date(value.accessedAt || 0).getTime();
    if (!accessedAt || Number.isNaN(accessedAt) || Date.now() - accessedAt > workspaceSessionMaxAgeMs) {
      clearWorkspaceAccess();
      return null;
    }

    return value;
  } catch {
    return null;
  }
})();

if (!workspaceAccess) {
  window.location.replace("/cms/");
}

const pageSurfaces = [
  {
    key: "home",
    title: "Homepage",
    source: "/content/site/home.json",
    route: "/",
    summary: "Hero, positioning, storefront lead-in, and growth narrative.",
  },
  {
    key: "about",
    title: "About",
    source: "/content/site/about.json",
    route: "/about.html",
    summary: "Brand identity, values, structure, and mission.",
  },
  {
    key: "projects",
    title: "Projects",
    source: "/content/site/projects.json",
    route: "/projects.html",
    summary: "Current pipeline, solution roadmap, and product logic.",
  },
  {
    key: "storefront",
    title: "Storefront",
    source: "/content/site/storefront.json",
    route: "/storefront.html",
    summary: "Digital offers, early access, and future product direction.",
  },
  {
    key: "journey",
    title: "Journey",
    source: "/content/site/journey.json",
    route: "/journey.html",
    summary: "Learning path, documentation, milestones, and direction.",
  },
  {
    key: "tech-stack",
    title: "Tech Stack",
    source: "/content/site/tech-stack.json",
    route: "/tech-stack.html",
    summary: "Primary tools, supporting tools, and technical story.",
  },
  {
    key: "certifications",
    title: "Certifications",
    source: "/content/site/certifications.json",
    route: "/certifications.html",
    summary: "Credibility signals, milestones, and growth proof.",
  },
  {
    key: "contact",
    title: "Contact",
    source: "/content/site/contact.json",
    route: "/contact.html",
    summary: "Lead capture, inbox messaging, and outreach guidance.",
  },
];

const viewMeta = {
  overview: {
    eyebrow: "Workspace",
    title: "CaribAI content manager",
    intro: "A simpler editorial layer for controlling the front end, publishing content, and keeping the site clean.",
  },
  pages: {
    eyebrow: "Pages",
    title: "Manage singleton pages",
    intro: "Each main public page should feel like a straightforward edit surface, not a dashboard widget.",
  },
  journal: {
    eyebrow: "Journal",
    title: "Manage publishing",
    intro: "Write, refine, feature, and publish with a cleaner editorial workflow.",
  },
  storefront: {
    eyebrow: "Storefront",
    title: "Manage visible offers",
    intro: "Keep the storefront practical, premium, and easy to update without losing the front-end feel.",
  },
  media: {
    eyebrow: "Media",
    title: "Manage visual assets",
    intro: "Organize logos, graphics, and supporting visuals in a calmer asset workflow.",
  },
  settings: {
    eyebrow: "Settings",
    title: "Manage shared controls",
    intro: "Keep the shared front-end controls centralized and simple to update.",
  },
};

const draftStorageKey = (scope, key) => `caribai-cms-draft:${scope}:${key}`;

const navItems = Array.from(document.querySelectorAll(".cms-nav-item"));
const viewPanels = Array.from(document.querySelectorAll("[data-view-panel]"));
const rowActions = Array.from(document.querySelectorAll("[data-view-target]"));
const createPostButton = document.getElementById("createPostButton");
const exitWorkspaceButton = document.getElementById("exitWorkspaceButton");
const workspaceIdentity = document.getElementById("workspaceIdentity");

const viewEyebrow = document.getElementById("viewEyebrow");
const viewTitle = document.getElementById("viewTitle");
const viewIntroCopy = document.getElementById("viewIntroCopy");

const pagesList = document.getElementById("pagesList");
const pageEditorTitle = document.getElementById("pageEditorTitle");
const pageEditorSummary = document.getElementById("pageEditorSummary");
const pageEditorStatus = document.getElementById("pageEditorStatus");
const pageEditorToolbar = document.getElementById("pageEditorToolbar");
const pageEditorSource = document.getElementById("pageEditorSource");
const pageSectionTabs = document.getElementById("pageSectionTabs");
const pageEditorForm = document.getElementById("pageEditorForm");
const pageFileSaveButton = document.getElementById("pageFileSaveButton");
const pageResetButton = document.getElementById("pageResetButton");
const pageDraftButton = document.getElementById("pageDraftButton");
const pageDownloadButton = document.getElementById("pageDownloadButton");
const pagePreviewButton = document.getElementById("pagePreviewButton");

const journalList = document.getElementById("journalList");
const journalEditorTitle = document.getElementById("journalEditorTitle");
const journalEditorSummary = document.getElementById("journalEditorSummary");
const journalEditorStatus = document.getElementById("journalEditorStatus");
const journalEditorToolbar = document.getElementById("journalEditorToolbar");
const journalEditorSource = document.getElementById("journalEditorSource");
const journalEditorForm = document.getElementById("journalEditorForm");
const journalCreateButton = document.getElementById("journalCreateButton");
const journalDeleteButton = document.getElementById("journalDeleteButton");
const journalFileSaveButton = document.getElementById("journalFileSaveButton");
const journalResetButton = document.getElementById("journalResetButton");
const journalDraftButton = document.getElementById("journalDraftButton");
const journalDownloadButton = document.getElementById("journalDownloadButton");
const journalPreviewButton = document.getElementById("journalPreviewButton");

const storefrontOfferList = document.getElementById("storefrontOfferList");
const storefrontEditorTitle = document.getElementById("storefrontEditorTitle");
const storefrontEditorSummary = document.getElementById("storefrontEditorSummary");
const storefrontEditorStatus = document.getElementById("storefrontEditorStatus");
const storefrontEditorToolbar = document.getElementById("storefrontEditorToolbar");
const storefrontEditorSource = document.getElementById("storefrontEditorSource");
const storefrontSectionTabs = document.getElementById("storefrontSectionTabs");
const storefrontEditorForm = document.getElementById("storefrontEditorForm");
const storefrontCreateButton = document.getElementById("storefrontCreateButton");
const storefrontDeleteButton = document.getElementById("storefrontDeleteButton");
const storefrontFileSaveButton = document.getElementById("storefrontFileSaveButton");
const storefrontResetButton = document.getElementById("storefrontResetButton");
const storefrontDraftButton = document.getElementById("storefrontDraftButton");
const storefrontDownloadButton = document.getElementById("storefrontDownloadButton");
const storefrontPreviewButton = document.getElementById("storefrontPreviewButton");
const pageWorkflowSwitch = document.getElementById("pageWorkflowSwitch");
const journalWorkflowSwitch = document.getElementById("journalWorkflowSwitch");
const storefrontWorkflowSwitch = document.getElementById("storefrontWorkflowSwitch");

const mediaGroupList = document.getElementById("mediaGroupList");
const mediaPanelTitle = document.getElementById("mediaPanelTitle");
const mediaPanelSummary = document.getElementById("mediaPanelSummary");
const mediaEditorStatus = document.getElementById("mediaEditorStatus");
const mediaEditorToolbar = document.getElementById("mediaEditorToolbar");
const mediaEditorSource = document.getElementById("mediaEditorSource");
const mediaPanelBody = document.getElementById("mediaPanelBody");
const mediaFileSaveButton = document.getElementById("mediaFileSaveButton");
const mediaResetButton = document.getElementById("mediaResetButton");
const mediaDraftButton = document.getElementById("mediaDraftButton");
const mediaDownloadButton = document.getElementById("mediaDownloadButton");
const mediaPreviewButton = document.getElementById("mediaPreviewButton");

const settingsSectionList = document.getElementById("settingsSectionList");
const settingsEditorTitle = document.getElementById("settingsEditorTitle");
const settingsEditorSummary = document.getElementById("settingsEditorSummary");
const settingsEditorStatus = document.getElementById("settingsEditorStatus");
const settingsEditorToolbar = document.getElementById("settingsEditorToolbar");
const settingsEditorSource = document.getElementById("settingsEditorSource");
const settingsSectionTabs = document.getElementById("settingsSectionTabs");
const settingsEditorForm = document.getElementById("settingsEditorForm");
const settingsFileSaveButton = document.getElementById("settingsFileSaveButton");
const settingsResetButton = document.getElementById("settingsResetButton");
const settingsDraftButton = document.getElementById("settingsDraftButton");
const settingsDownloadButton = document.getElementById("settingsDownloadButton");
const settingsPreviewButton = document.getElementById("settingsPreviewButton");

let activePageKey = pageSurfaces[0].key;
let activePageOriginal = null;
let activePageData = null;
let activeSectionKey = null;
let activePageFileHandle = null;
let pageWorkflowIndex = Object.fromEntries(pageSurfaces.map((surface) => [surface.key, "live"]));
let pageWorkflowIndexed = false;

let blogPayloadOriginal = null;
let blogPayloadData = null;
let activePostSlug = null;
let activePostFileHandle = null;
let pendingJournalCreate = false;

let storefrontOriginal = null;
let storefrontData = null;
let activeStorefrontView = "products";
let activeStorefrontProductIndex = 0;
let activeStorefrontFileHandle = null;
let pendingStorefrontCreate = false;

let settingsOriginal = null;
let settingsData = null;
let activeSettingsSection = "brand";
let activeSettingsFileHandle = null;
let mediaOriginal = null;
let mediaData = null;
let activeMediaGroup = "brand";
let activeMediaFileHandle = null;
const hiddenEditorKeys = new Set(["_workflowStatus", "workflowStatus"]);
const workflowStates = ["draft", "ready", "live"];
let hasUnsavedChanges = false;

if (workspaceIdentity && workspaceAccess) {
  const label = workspaceAccess.role ? `${workspaceAccess.email} · ${workspaceAccess.role}` : workspaceAccess.email;
  workspaceIdentity.textContent = label;
}

const deepClone = (value) => JSON.parse(JSON.stringify(value));
const getSurface = (pageKey) => pageSurfaces.find((surface) => surface.key === pageKey);

const humanizeKey = (value) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const setDirtyState = (nextValue) => {
  hasUnsavedChanges = nextValue;
};

const setNestedValue = (obj, path, nextValue) => {
  let cursor = obj;
  for (let index = 0; index < path.length - 1; index += 1) {
    cursor = cursor[path[index]];
  }
  cursor[path[path.length - 1]] = nextValue;
};

const updatePageStatus = (message) => {
  pageEditorStatus.textContent = message;
};

const updateJournalStatus = (message) => {
  journalEditorStatus.textContent = message;
};

const updateStorefrontStatus = (message) => {
  storefrontEditorStatus.textContent = message;
};

const updateSettingsStatus = (message) => {
  settingsEditorStatus.textContent = message;
};

const updateMediaStatus = (message) => {
  mediaEditorStatus.textContent = message;
};

const normalizeWorkflowStatus = (value) => (workflowStates.includes(value) ? value : "draft");

const workflowLabel = (value) => {
  const status = normalizeWorkflowStatus(value);
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const workflowPillMarkup = (value) =>
  `<span class="status-pill workflow-${normalizeWorkflowStatus(value)}">${workflowLabel(value)}</span>`;

const renderWorkflowSwitch = (container, currentStatus, onSet) => {
  if (!container) return;
  const status = normalizeWorkflowStatus(currentStatus);
  container.innerHTML = workflowStates
    .map(
      (value) => `
        <button class="workflow-button ${value === status ? "is-active" : ""}" data-workflow-value="${value}" type="button">
          ${workflowLabel(value)}
        </button>
      `
    )
    .join("");

  container.querySelectorAll("[data-workflow-value]").forEach((button) => {
    button.addEventListener("click", () => onSet(button.dataset.workflowValue));
  });
};

const createFieldWrapper = (labelText, helpText = "") => {
  const wrapper = document.createElement("div");
  wrapper.className = "field-group";

  const label = document.createElement("label");
  label.textContent = labelText;
  wrapper.appendChild(label);

  if (helpText) {
    const help = document.createElement("p");
    help.className = "field-help";
    help.textContent = helpText;
    wrapper.appendChild(help);
  }

  return wrapper;
};

const createRemoveButton = (onClick) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "small-button";
  button.textContent = "Remove";
  button.addEventListener("click", onClick);
  return button;
};

function renderPrimitiveInput(container, value, path, label, onChange) {
  const wrapper = createFieldWrapper(label);

  if (typeof value === "boolean") {
    const checkWrap = document.createElement("label");
    checkWrap.className = "field-checkbox-wrap";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = value;
    input.addEventListener("change", () => onChange(path, input.checked));

    const text = document.createElement("span");
    text.textContent = value ? "Enabled" : "Disabled";
    input.addEventListener("change", () => {
      text.textContent = input.checked ? "Enabled" : "Disabled";
    });

    checkWrap.append(input, text);
    wrapper.appendChild(checkWrap);
    container.appendChild(wrapper);
    return;
  }

  const isLongText = typeof value === "string" && (value.includes("\n") || value.length > 120);
  const input = isLongText ? document.createElement("textarea") : document.createElement("input");
  input.className = isLongText ? "field-textarea" : "field-input";
  if (!isLongText) {
    input.type = typeof value === "number" ? "number" : "text";
  }

  input.value = value ?? "";
  input.addEventListener("input", () => {
    const nextValue = typeof value === "number" ? Number(input.value) : input.value;
    onChange(path, nextValue);
  });

  wrapper.appendChild(input);
  container.appendChild(wrapper);
}

function renderArrayEditor(container, values, path, label, onChange, rerender) {
  const wrapper = document.createElement("div");
  wrapper.className = "field-group";

  const title = document.createElement("label");
  title.textContent = label;
  wrapper.appendChild(title);

  const arrayPanel = document.createElement("div");
  arrayPanel.className = "nested-panel";

  const head = document.createElement("div");
  head.className = "array-head";

  const info = document.createElement("span");
  info.className = "field-help";
  info.textContent = `${values.length} item${values.length === 1 ? "" : "s"}`;

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "small-button";
  addButton.textContent = "Add item";
  addButton.addEventListener("click", () => {
    const template =
      values.length > 0
        ? typeof values[0] === "object" && values[0] !== null
          ? deepClone(values[0])
          : ""
        : "";
    onChange(path, [...values, template]);
    rerender();
  });

  head.append(info, addButton);
  arrayPanel.appendChild(head);

  const list = document.createElement("div");
  list.className = "array-list";

  values.forEach((item, index) => {
    const itemPath = [...path, index];
    const itemBox = document.createElement("div");
    itemBox.className = "array-item";

    const itemHead = document.createElement("div");
    itemHead.className = "array-head";

    const itemTitle = document.createElement("strong");
    itemTitle.textContent = `${label} ${index + 1}`;

    const removeButton = createRemoveButton(() => {
      const nextArray = [...values];
      nextArray.splice(index, 1);
      onChange(path, nextArray);
      rerender();
    });

    itemHead.append(itemTitle, removeButton);
    itemBox.appendChild(itemHead);

    const itemStack = document.createElement("div");
    itemStack.className = "field-stack";
    itemBox.appendChild(itemStack);

    renderValueEditor(itemStack, item, itemPath, humanizeKey(label), onChange, rerender);
    list.appendChild(itemBox);
  });

  arrayPanel.appendChild(list);
  wrapper.appendChild(arrayPanel);
  container.appendChild(wrapper);
}

function renderObjectEditor(container, value, path, label, onChange, rerender) {
  const wrapper = document.createElement("div");
  wrapper.className = "field-group";

  const title = document.createElement("label");
  title.textContent = label;
  wrapper.appendChild(title);

  const panel = document.createElement("div");
  panel.className = "nested-panel";

  const stack = document.createElement("div");
  stack.className = "field-stack";

  Object.entries(value)
    .filter(([childKey]) => !hiddenEditorKeys.has(childKey))
    .forEach(([childKey, childValue]) => {
    renderValueEditor(stack, childValue, [...path, childKey], humanizeKey(childKey), onChange, rerender);
    });

  panel.appendChild(stack);
  wrapper.appendChild(panel);
  container.appendChild(wrapper);
}

function renderValueEditor(container, value, path, label, onChange, rerender) {
  if (Array.isArray(value)) {
    renderArrayEditor(container, value, path, label, onChange, rerender);
    return;
  }

  if (typeof value === "object" && value !== null) {
    renderObjectEditor(container, value, path, label, onChange, rerender);
    return;
  }

  renderPrimitiveInput(container, value, path, label, onChange);
}

const saveDraft = (scope, key, data, setStatus) => {
  if (!data || !key) return;
  localStorage.setItem(draftStorageKey(scope, key), JSON.stringify(data, null, 2));
  setDirtyState(false);
  setStatus("Draft saved");
};

const saveJsonToFile = async (filename, data, setStatus, getHandle, setHandle) => {
  if (!data) return;

  if (!window.showSaveFilePicker && !window.showOpenFilePicker) {
    setStatus("Direct file save is not supported here");
    return;
  }

  try {
    let handle = getHandle();
    if (!handle) {
      if (window.showSaveFilePicker) {
        handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: "JSON files",
              accept: {
                "application/json": [".json"],
              },
            },
          ],
        });
      } else {
        [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: "JSON files",
              accept: {
                "application/json": [".json"],
              },
            },
          ],
        });
      }
      setHandle(handle);
    }

    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    setDirtyState(false);
    setStatus("Saved to file");
  } catch (error) {
    if (error?.name === "AbortError") {
      setStatus("File save cancelled");
      return;
    }
    setStatus("File save failed");
    console.error(error);
  }
};

const downloadJson = (filename, data, setStatus) => {
  if (!data) return;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setDirtyState(false);
  setStatus("JSON exported");
};

const createDefaultPost = () => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const baseTitle = "New Journal Post";
  return {
    title: baseTitle,
    slug: `new-journal-post-${Date.now()}`,
    publishDate: timestamp,
    category: "Founder Notes",
    workflowStatus: "draft",
    featured: false,
    coverImage: "",
    coverVideo: "",
    excerpt: "Add a concise excerpt that supports the CaribAI story.",
    body: "Start writing here.",
  };
};

const createDefaultStorefrontItem = () => ({
  badge: "New Offer",
  title: "New Product Offer",
  image: "assets/graphics/ai-toolkit-card.svg",
  imageAlt: "New product visual",
  description: "Describe the new offer clearly and practically.",
  meta: ["Category: Digital Product", "Status: Draft Offer"],
  workflowStatus: "draft",
  muted: true,
  featured: false,
});

const getPageWorkflowStatus = (pageKey) => normalizeWorkflowStatus(pageWorkflowIndex[pageKey] || "live");
const getPostWorkflowStatus = (post) => normalizeWorkflowStatus(post?.workflowStatus || "live");
const getStorefrontWorkflowStatus = (item) => normalizeWorkflowStatus(item?.workflowStatus || "draft");

const loadPageWorkflowIndex = async () => {
  if (pageWorkflowIndexed) return;
  const results = await Promise.all(
    pageSurfaces.map(async (surface) => {
      try {
        const response = await fetch(surface.source, { cache: "no-store" });
        if (!response.ok) return [surface.key, getPageWorkflowStatus(surface.key)];
        const payload = await response.json();
        return [surface.key, normalizeWorkflowStatus(payload._workflowStatus || "live")];
      } catch {
        return [surface.key, getPageWorkflowStatus(surface.key)];
      }
    })
  );

  pageWorkflowIndex = Object.fromEntries(results);
  pageWorkflowIndexed = true;
  renderPagesList();
};

const renderPagesList = () => {
  pagesList.innerHTML = pageSurfaces
    .map(
      (page) => `
        <button class="page-list-item ${page.key === activePageKey ? "is-active" : ""}" data-page-key="${page.key}" type="button">
          <strong>${page.title}</strong>
          <div class="page-list-meta">
            <span>${page.summary}</span>
            ${workflowPillMarkup(getPageWorkflowStatus(page.key))}
          </div>
        </button>
      `
    )
    .join("");

  pagesList.querySelectorAll("[data-page-key]").forEach((button) => {
    button.addEventListener("click", () => loadPage(button.dataset.pageKey));
  });
};

const renderPageEditor = () => {
  if (!activePageData) {
    pageEditorForm.innerHTML = '<div class="editor-empty">Select a page to begin editing.</div>';
    return;
  }

  const surface = getSurface(activePageKey);
  const sections = Object.keys(activePageData).filter((key) => !key.startsWith("_"));
  const sectionKey = activeSectionKey && sections.includes(activeSectionKey) ? activeSectionKey : sections[0];
  activeSectionKey = sectionKey;

  pageEditorTitle.textContent = surface.title;
  pageEditorSummary.textContent = surface.summary;
  pageEditorSource.textContent = surface.source;
  pagePreviewButton.href = surface.route;
  pageEditorToolbar.hidden = false;
  pageSectionTabs.hidden = false;
  renderWorkflowSwitch(pageWorkflowSwitch, activePageData._workflowStatus || "live", (status) => {
    activePageData._workflowStatus = status;
    pageWorkflowIndex[activePageKey] = status;
    setDirtyState(true);
    updatePageStatus(`Status set to ${workflowLabel(status)}`);
    renderPagesList();
    renderPageEditor();
  });

  pageSectionTabs.innerHTML = "";
  sections.forEach((key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `section-tab ${key === sectionKey ? "is-active" : ""}`;
    button.textContent = humanizeKey(key);
    button.addEventListener("click", () => {
      activeSectionKey = key;
      renderPageEditor();
    });
    pageSectionTabs.appendChild(button);
  });

  const fieldStack = document.createElement("div");
  fieldStack.className = "field-stack";
  renderValueEditor(
    fieldStack,
    activePageData[sectionKey],
    [sectionKey],
    humanizeKey(sectionKey),
    (path, nextValue) => {
      setNestedValue(activePageData, path, nextValue);
      setDirtyState(true);
      updatePageStatus("Draft in progress");
    },
    renderPageEditor
  );

  pageEditorForm.innerHTML = "";
  pageEditorForm.appendChild(fieldStack);
};

const loadPage = async (pageKey) => {
  const surface = getSurface(pageKey);
  if (!surface) return;

  activePageKey = pageKey;
  activeSectionKey = null;
  activePageFileHandle = null;

  const response = await fetch(surface.source, { cache: "no-store" });
  if (!response.ok) {
    pageEditorTitle.textContent = surface.title;
    pageEditorSummary.textContent = "The source file could not be loaded.";
    updatePageStatus("Load failed");
    pageEditorToolbar.hidden = true;
    pageSectionTabs.hidden = true;
    pageEditorForm.innerHTML = '<div class="editor-empty">Unable to load this page source right now.</div>';
    return;
  }

  const payload = await response.json();
  payload._workflowStatus = normalizeWorkflowStatus(payload._workflowStatus || "live");
  activePageOriginal = deepClone(payload);
  const storedDraft = localStorage.getItem(draftStorageKey("page", pageKey));
  activePageData = storedDraft ? JSON.parse(storedDraft) : deepClone(payload);
  activePageData._workflowStatus = normalizeWorkflowStatus(activePageData._workflowStatus || payload._workflowStatus || "live");
  pageWorkflowIndex[pageKey] = normalizeWorkflowStatus(activePageData._workflowStatus || payload._workflowStatus || "live");
  setDirtyState(false);
  updatePageStatus(storedDraft ? "Draft loaded" : "Loaded");
  renderPagesList();
  renderPageEditor();
};

const renderJournalList = () => {
  const posts = blogPayloadData?.posts || [];

  journalList.innerHTML = posts
    .map(
      (post) => `
        <button class="page-list-item ${post.slug === activePostSlug ? "is-active" : ""}" data-post-slug="${post.slug}" type="button">
          <strong>${post.title}</strong>
          <div class="page-list-meta">
            <span>${post.category || "Uncategorized"}</span>
            ${workflowPillMarkup(getPostWorkflowStatus(post))}
          </div>
        </button>
      `
    )
    .join("");

  journalList.querySelectorAll("[data-post-slug]").forEach((button) => {
    button.addEventListener("click", () => {
      activePostSlug = button.dataset.postSlug;
      renderJournalList();
      renderJournalEditor();
    });
  });
};

const renderJournalEditor = () => {
  if (!blogPayloadData?.posts?.length) {
    journalEditorTitle.textContent = "Journal";
    journalEditorSummary.textContent = "No posts are available yet. Create one to begin publishing.";
    journalEditorToolbar.hidden = true;
    journalEditorForm.innerHTML = '<div class="editor-empty">No posts are available to edit yet.</div>';
    return;
  }

  const post = blogPayloadData.posts.find((item) => item.slug === activePostSlug) || blogPayloadData.posts[0];
  activePostSlug = post.slug;
  renderJournalList();

  journalEditorTitle.textContent = post.title;
  journalEditorSummary.textContent = post.excerpt || "Edit this post’s publishing data and article content.";
  journalEditorSource.textContent = "/content/blog/posts.json";
  journalPreviewButton.href = `/blog-post.html?slug=${encodeURIComponent(post.slug)}`;
  journalEditorToolbar.hidden = false;
  journalDeleteButton.hidden = false;
  renderWorkflowSwitch(journalWorkflowSwitch, getPostWorkflowStatus(post), (status) => {
    post.workflowStatus = status;
    setDirtyState(true);
    updateJournalStatus(`Status set to ${workflowLabel(status)}`);
    renderJournalList();
    renderJournalEditor();
  });

  const fieldStack = document.createElement("div");
  fieldStack.className = "field-stack";
  renderValueEditor(
    fieldStack,
    post,
    ["posts", blogPayloadData.posts.findIndex((item) => item.slug === post.slug)],
    "Post",
    (path, nextValue) => {
      setNestedValue(blogPayloadData, path, nextValue);
      setDirtyState(true);
      updateJournalStatus("Draft in progress");
      if (path[path.length - 1] === "title") {
        const nextSlug = slugify(nextValue) || `journal-post-${Date.now()}`;
        post.slug = nextSlug;
        activePostSlug = nextSlug;
      }
      if (path[path.length - 1] === "slug") {
        activePostSlug = slugify(nextValue) || activePostSlug;
        post.slug = activePostSlug;
      }
      renderJournalList();
    },
    renderJournalEditor
  );

  journalEditorForm.innerHTML = "";
  journalEditorForm.appendChild(fieldStack);
};

const loadJournal = async () => {
  activePostFileHandle = null;
  const response = await fetch("/content/blog/posts.json", { cache: "no-store" });

  if (!response.ok) {
    journalEditorTitle.textContent = "Journal";
    journalEditorSummary.textContent = "The posts source could not be loaded.";
    updateJournalStatus("Load failed");
    journalEditorToolbar.hidden = true;
    journalEditorForm.innerHTML = '<div class="editor-empty">Unable to load the journal source right now.</div>';
    return;
  }

  const payload = await response.json();
  payload.posts = (payload.posts || []).map((post) => ({
    ...post,
    workflowStatus: normalizeWorkflowStatus(post.workflowStatus || "live"),
  }));
  blogPayloadOriginal = deepClone(payload);
  const storedDraft = localStorage.getItem(draftStorageKey("journal", "posts"));
  blogPayloadData = storedDraft ? JSON.parse(storedDraft) : deepClone(payload);
  blogPayloadData.posts = (blogPayloadData.posts || []).map((post) => ({
    ...post,
    workflowStatus: normalizeWorkflowStatus(post.workflowStatus || "live"),
  }));
  activePostSlug = blogPayloadData.posts?.[0]?.slug || null;
  setDirtyState(false);
  updateJournalStatus(storedDraft ? "Draft loaded" : "Loaded");
  if (pendingJournalCreate) {
    pendingJournalCreate = false;
    createJournalPost();
    return;
  }
  renderJournalList();
  renderJournalEditor();
};

const createJournalPost = () => {
  if (!blogPayloadData) return;
  const nextPost = createDefaultPost();
  blogPayloadData.posts.unshift(nextPost);
  activePostSlug = nextPost.slug;
  setDirtyState(true);
  updateJournalStatus("New post created");
  renderJournalList();
  renderJournalEditor();
};

const deleteJournalPost = () => {
  if (!blogPayloadData?.posts?.length || !activePostSlug) return;
  const nextPosts = blogPayloadData.posts.filter((post) => post.slug !== activePostSlug);
  blogPayloadData.posts = nextPosts;
  activePostSlug = nextPosts[0]?.slug || null;
  setDirtyState(true);
  updateJournalStatus("Post deleted");
  renderJournalList();
  renderJournalEditor();
};

const renderStorefrontOfferList = () => {
  const items = storefrontData?.products?.items || [];
  storefrontOfferList.innerHTML = items
    .map(
      (item, index) => `
        <button class="page-list-item ${index === activeStorefrontProductIndex && activeStorefrontView === "products" ? "is-active" : ""}" data-offer-index="${index}" type="button">
          <strong>${item.title || `Offer ${index + 1}`}</strong>
          <div class="page-list-meta">
            <span>${item.badge || item.meta?.[0] || "Product card"}</span>
            ${workflowPillMarkup(getStorefrontWorkflowStatus(item))}
          </div>
        </button>
      `
    )
    .join("");

  storefrontOfferList.querySelectorAll("[data-offer-index]").forEach((button) => {
    button.addEventListener("click", () => {
      activeStorefrontView = "products";
      activeStorefrontProductIndex = Number(button.dataset.offerIndex);
      renderStorefrontOfferList();
      renderStorefrontEditor();
    });
  });
};

const renderStorefrontEditor = () => {
  if (!storefrontData) {
    storefrontEditorForm.innerHTML = '<div class="editor-empty">Storefront content is not loaded yet.</div>';
    return;
  }

  const sections = Object.keys(storefrontData).filter((key) => !key.startsWith("_"));
  storefrontSectionTabs.hidden = false;
  storefrontEditorToolbar.hidden = false;
  storefrontEditorSource.textContent = "/content/site/storefront.json";
  storefrontPreviewButton.href = "/storefront.html";
  storefrontDeleteButton.hidden = activeStorefrontView !== "products" || !(storefrontData.products?.items?.length);
  renderWorkflowSwitch(
    storefrontWorkflowSwitch,
    activeStorefrontView === "products" && storefrontData.products?.items?.length
      ? getStorefrontWorkflowStatus(storefrontData.products.items[activeStorefrontProductIndex] || storefrontData.products.items[0])
      : normalizeWorkflowStatus(storefrontData._workflowStatus || "live"),
    (status) => {
      if (activeStorefrontView === "products" && storefrontData.products?.items?.length) {
        const target = storefrontData.products.items[activeStorefrontProductIndex] || storefrontData.products.items[0];
        if (target) target.workflowStatus = status;
      } else {
        storefrontData._workflowStatus = status;
      }
      setDirtyState(true);
      updateStorefrontStatus(`Status set to ${workflowLabel(status)}`);
      renderStorefrontOfferList();
      renderStorefrontEditor();
    }
  );

  storefrontSectionTabs.innerHTML = "";

  ["hero", "summary", "lead", "cta"].forEach((sectionKey) => {
    if (!sections.includes(sectionKey)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `section-tab ${activeStorefrontView === sectionKey ? "is-active" : ""}`;
    button.textContent = humanizeKey(sectionKey);
    button.addEventListener("click", () => {
      activeStorefrontView = sectionKey;
      renderStorefrontEditor();
    });
    storefrontSectionTabs.appendChild(button);
  });

  if (storefrontData.products?.items?.length) {
    const productButton = document.createElement("button");
    productButton.type = "button";
    productButton.className = `section-tab ${activeStorefrontView === "products" ? "is-active" : ""}`;
    productButton.textContent = "Product Cards";
    productButton.addEventListener("click", () => {
      activeStorefrontView = "products";
      renderStorefrontEditor();
    });
    storefrontSectionTabs.appendChild(productButton);
  }

  const fieldStack = document.createElement("div");
  fieldStack.className = "field-stack";

  if (activeStorefrontView === "products" && storefrontData.products?.items?.length) {
    const items = storefrontData.products.items;
    const product = items[activeStorefrontProductIndex] || items[0];
    activeStorefrontProductIndex = items.indexOf(product);
    storefrontEditorTitle.textContent = product.title || `Offer ${activeStorefrontProductIndex + 1}`;
    storefrontEditorSummary.textContent = product.description || "Edit this storefront card and its visible product details.";

    renderValueEditor(
      fieldStack,
      product,
      ["products", "items", activeStorefrontProductIndex],
      "Product Card",
      (path, nextValue) => {
        setNestedValue(storefrontData, path, nextValue);
        setDirtyState(true);
        updateStorefrontStatus("Draft in progress");
        if (path[path.length - 1] === "title") {
          renderStorefrontOfferList();
        }
      },
      renderStorefrontEditor
    );
  } else {
    const sectionKey = sections.includes(activeStorefrontView) ? activeStorefrontView : "hero";
    activeStorefrontView = sectionKey;
    storefrontEditorTitle.textContent = `Storefront ${humanizeKey(sectionKey)}`;
    storefrontEditorSummary.textContent = "Edit this section of the public storefront page.";

    renderValueEditor(
      fieldStack,
      storefrontData[sectionKey],
      [sectionKey],
      humanizeKey(sectionKey),
      (path, nextValue) => {
        setNestedValue(storefrontData, path, nextValue);
        updateStorefrontStatus("Draft in progress");
        if (path[0] === "products") {
          renderStorefrontOfferList();
        }
      },
      renderStorefrontEditor
    );
  }

  storefrontEditorForm.innerHTML = "";
  storefrontEditorForm.appendChild(fieldStack);
};

const loadStorefront = async () => {
  activeStorefrontFileHandle = null;
  const response = await fetch("/content/site/storefront.json", { cache: "no-store" });

  if (!response.ok) {
    storefrontEditorTitle.textContent = "Storefront";
    storefrontEditorSummary.textContent = "The storefront source could not be loaded.";
    updateStorefrontStatus("Load failed");
    storefrontEditorToolbar.hidden = true;
    storefrontSectionTabs.hidden = true;
    storefrontEditorForm.innerHTML = '<div class="editor-empty">Unable to load the storefront source right now.</div>';
    return;
  }

  const payload = await response.json();
  payload._workflowStatus = normalizeWorkflowStatus(payload._workflowStatus || "live");
  if (payload.products?.items) {
    payload.products.items = payload.products.items.map((item) => ({
      ...item,
      workflowStatus: normalizeWorkflowStatus(
        item.workflowStatus || (String(item.badge || "").toLowerCase().includes("future") ? "ready" : "live")
      ),
    }));
  }
  storefrontOriginal = deepClone(payload);
  const storedDraft = localStorage.getItem(draftStorageKey("storefront", "page"));
  storefrontData = storedDraft ? JSON.parse(storedDraft) : deepClone(payload);
  storefrontData._workflowStatus = normalizeWorkflowStatus(storefrontData._workflowStatus || payload._workflowStatus || "live");
  if (storefrontData.products?.items) {
    storefrontData.products.items = storefrontData.products.items.map((item) => ({
      ...item,
      workflowStatus: normalizeWorkflowStatus(
        item.workflowStatus || (String(item.badge || "").toLowerCase().includes("future") ? "ready" : "live")
      ),
    }));
  }
  activeStorefrontView = "products";
  activeStorefrontProductIndex = 0;
  setDirtyState(false);
  updateStorefrontStatus(storedDraft ? "Draft loaded" : "Loaded");
  if (pendingStorefrontCreate) {
    pendingStorefrontCreate = false;
    createStorefrontItem();
    return;
  }
  renderStorefrontOfferList();
  renderStorefrontEditor();
};

const createStorefrontItem = () => {
  if (!storefrontData?.products?.items) return;
  const nextItem = createDefaultStorefrontItem();
  storefrontData.products.items.push(nextItem);
  activeStorefrontView = "products";
  activeStorefrontProductIndex = storefrontData.products.items.length - 1;
  setDirtyState(true);
  updateStorefrontStatus("New offer created");
  renderStorefrontOfferList();
  renderStorefrontEditor();
};

const deleteStorefrontItem = () => {
  if (!storefrontData?.products?.items?.length || activeStorefrontView !== "products") return;
  storefrontData.products.items.splice(activeStorefrontProductIndex, 1);
  if (storefrontData.products.items.length === 0) {
    activeStorefrontView = "hero";
    activeStorefrontProductIndex = 0;
  } else {
    activeStorefrontProductIndex = Math.max(0, activeStorefrontProductIndex - 1);
  }
  setDirtyState(true);
  updateStorefrontStatus("Offer deleted");
  renderStorefrontOfferList();
  renderStorefrontEditor();
};

const renderMediaGroupList = () => {
  const groups = Object.entries(mediaData || {});
  mediaGroupList.innerHTML = groups
    .map(
      ([groupKey, group]) => `
        <button class="page-list-item ${groupKey === activeMediaGroup ? "is-active" : ""}" data-media-group="${groupKey}" type="button">
          <strong>${group.title}</strong>
          <span>${group.description}</span>
        </button>
      `
    )
    .join("");

  mediaGroupList.querySelectorAll("[data-media-group]").forEach((button) => {
    button.addEventListener("click", () => {
      activeMediaGroup = button.dataset.mediaGroup;
      renderMediaGroupList();
      renderMediaPanel();
    });
  });
};

const renderMediaPanel = () => {
  if (!mediaData) {
    mediaPanelBody.innerHTML = '<div class="editor-empty">Media sources are not loaded yet.</div>';
    return;
  }

  const groupKeys = Object.keys(mediaData);
  const groupKey = groupKeys.includes(activeMediaGroup) ? activeMediaGroup : groupKeys[0];
  activeMediaGroup = groupKey;
  const group = mediaData[groupKey];

  mediaPanelTitle.textContent = group.title;
  mediaPanelSummary.textContent = group.description;
  mediaEditorSource.textContent = "/content/site/media.json";
  mediaPreviewButton.href = "/";
  mediaEditorToolbar.hidden = false;
  renderMediaGroupList();

  const wrapper = document.createElement("div");
  wrapper.className = "field-stack";

  const fieldStack = document.createElement("div");
  fieldStack.className = "field-stack";
  renderValueEditor(
    fieldStack,
    group,
    [groupKey],
    group.title,
    (path, nextValue) => {
      setNestedValue(mediaData, path, nextValue);
      setDirtyState(true);
      updateMediaStatus("Draft in progress");
      renderMediaGroupList();
    },
    renderMediaPanel
  );
  wrapper.appendChild(fieldStack);

  if (Array.isArray(group.items) && group.items.length) {
    const assetGrid = document.createElement("div");
    assetGrid.className = "asset-grid";

    group.items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "asset-card";

      const assetPath = item.path || "";
      const isVisualAsset = /\.(png|jpg|jpeg|svg|webp|gif)$/i.test(assetPath);
      const isRemote = /^https?:\/\//i.test(assetPath);
      const previewPath = isRemote ? assetPath : `/${assetPath}`;

      if (isVisualAsset) {
        const image = document.createElement("img");
        image.src = previewPath;
        image.alt = item.alt || item.title || "Media preview";
        card.appendChild(image);
      }

      const title = document.createElement("h3");
      title.textContent = item.title || "Untitled asset";
      card.appendChild(title);

      const notes = document.createElement("p");
      notes.textContent = item.notes || "No notes provided for this asset yet.";
      card.appendChild(notes);

      const meta = document.createElement("div");
      meta.className = "table-meta";
      const code = document.createElement("code");
      code.textContent = assetPath;
      meta.appendChild(code);
      card.appendChild(meta);

      assetGrid.appendChild(card);
    });

    wrapper.appendChild(assetGrid);
  }

  mediaPanelBody.innerHTML = "";
  mediaPanelBody.appendChild(wrapper);
};

const loadMedia = async () => {
  activeMediaFileHandle = null;
  const response = await fetch("/content/site/media.json", { cache: "no-store" });

  if (!response.ok) {
    mediaPanelTitle.textContent = "Media";
    mediaPanelSummary.textContent = "The media source could not be loaded.";
    updateMediaStatus("Load failed");
    mediaEditorToolbar.hidden = true;
    mediaPanelBody.innerHTML = '<div class="editor-empty">Unable to load the media source right now.</div>';
    return;
  }

  const payload = await response.json();
  mediaOriginal = deepClone(payload);
  const storedDraft = localStorage.getItem(draftStorageKey("media", "library"));
  mediaData = storedDraft ? JSON.parse(storedDraft) : deepClone(payload);
  activeMediaGroup = Object.keys(mediaData)[0] || "brand";
  setDirtyState(false);
  updateMediaStatus(storedDraft ? "Draft loaded" : "Loaded");
  renderMediaGroupList();
  renderMediaPanel();
};

const renderSettingsSectionList = () => {
  const sections = Object.keys(settingsData || {});
  settingsSectionList.innerHTML = sections
    .map(
      (section) => `
        <button class="page-list-item ${section === activeSettingsSection ? "is-active" : ""}" data-settings-section="${section}" type="button">
          <strong>${humanizeKey(section)}</strong>
          <span>Shared ${humanizeKey(section).toLowerCase()} controls</span>
        </button>
      `
    )
    .join("");

  settingsSectionList.querySelectorAll("[data-settings-section]").forEach((button) => {
    button.addEventListener("click", () => {
      activeSettingsSection = button.dataset.settingsSection;
      renderSettingsSectionList();
      renderSettingsEditor();
    });
  });
};

const renderSettingsEditor = () => {
  if (!settingsData) {
    settingsEditorForm.innerHTML = '<div class="editor-empty">Shared site settings are not loaded yet.</div>';
    return;
  }

  const sections = Object.keys(settingsData);
  const sectionKey = sections.includes(activeSettingsSection) ? activeSettingsSection : sections[0];
  activeSettingsSection = sectionKey;

  settingsEditorTitle.textContent = `Settings ${humanizeKey(sectionKey)}`;
  settingsEditorSummary.textContent = "Edit the shared controls that affect navigation, footer, branding, and contact routing.";
  settingsEditorSource.textContent = "/content/site/settings.json";
  settingsPreviewButton.href = "/";
  settingsEditorToolbar.hidden = false;
  settingsSectionTabs.hidden = false;

  settingsSectionTabs.innerHTML = "";
  sections.forEach((key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `section-tab ${key === sectionKey ? "is-active" : ""}`;
    button.textContent = humanizeKey(key);
    button.addEventListener("click", () => {
      activeSettingsSection = key;
      renderSettingsEditor();
      renderSettingsSectionList();
    });
    settingsSectionTabs.appendChild(button);
  });

  const fieldStack = document.createElement("div");
  fieldStack.className = "field-stack";
  renderValueEditor(
    fieldStack,
    settingsData[sectionKey],
    [sectionKey],
    humanizeKey(sectionKey),
    (path, nextValue) => {
      setNestedValue(settingsData, path, nextValue);
      setDirtyState(true);
      updateSettingsStatus("Draft in progress");
    },
    renderSettingsEditor
  );

  settingsEditorForm.innerHTML = "";
  settingsEditorForm.appendChild(fieldStack);
};

const loadSettings = async () => {
  activeSettingsFileHandle = null;
  const response = await fetch("/content/site/settings.json", { cache: "no-store" });

  if (!response.ok) {
    settingsEditorTitle.textContent = "Settings";
    settingsEditorSummary.textContent = "The shared settings source could not be loaded.";
    updateSettingsStatus("Load failed");
    settingsEditorToolbar.hidden = true;
    settingsSectionTabs.hidden = true;
    settingsEditorForm.innerHTML = '<div class="editor-empty">Unable to load the shared settings source right now.</div>';
    return;
  }

  const payload = await response.json();
  settingsOriginal = deepClone(payload);
  const storedDraft = localStorage.getItem(draftStorageKey("settings", "site"));
  settingsData = storedDraft ? JSON.parse(storedDraft) : deepClone(payload);
  activeSettingsSection = Object.keys(settingsData)[0] || "brand";
  setDirtyState(false);
  updateSettingsStatus(storedDraft ? "Draft loaded" : "Loaded");
  renderSettingsSectionList();
  renderSettingsEditor();
};

const resetPage = () => {
  if (!activePageOriginal) return;
  activePageData = deepClone(activePageOriginal);
  localStorage.removeItem(draftStorageKey("page", activePageKey));
  setDirtyState(false);
  updatePageStatus("Reset to source");
  renderPageEditor();
};

const resetJournal = () => {
  if (!blogPayloadOriginal) return;
  blogPayloadData = deepClone(blogPayloadOriginal);
  localStorage.removeItem(draftStorageKey("journal", "posts"));
  activePostSlug = blogPayloadData.posts?.[0]?.slug || null;
  setDirtyState(false);
  updateJournalStatus("Reset to source");
  renderJournalList();
  renderJournalEditor();
};

const resetStorefront = () => {
  if (!storefrontOriginal) return;
  storefrontData = deepClone(storefrontOriginal);
  localStorage.removeItem(draftStorageKey("storefront", "page"));
  activeStorefrontView = "products";
  activeStorefrontProductIndex = 0;
  setDirtyState(false);
  updateStorefrontStatus("Reset to source");
  renderStorefrontOfferList();
  renderStorefrontEditor();
};

const resetSettings = () => {
  if (!settingsOriginal) return;
  settingsData = deepClone(settingsOriginal);
  localStorage.removeItem(draftStorageKey("settings", "site"));
  activeSettingsSection = Object.keys(settingsData)[0] || "brand";
  setDirtyState(false);
  updateSettingsStatus("Reset to source");
  renderSettingsSectionList();
  renderSettingsEditor();
};

const resetMedia = () => {
  if (!mediaOriginal) return;
  mediaData = deepClone(mediaOriginal);
  localStorage.removeItem(draftStorageKey("media", "library"));
  activeMediaGroup = Object.keys(mediaData)[0] || "brand";
  setDirtyState(false);
  updateMediaStatus("Reset to source");
  renderMediaGroupList();
  renderMediaPanel();
};

const setView = (view) => {
  const meta = viewMeta[view] || viewMeta.overview;

  navItems.forEach((item) => item.classList.toggle("is-active", item.dataset.view === view));
  viewPanels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.viewPanel === view));

  viewEyebrow.textContent = meta.eyebrow;
  viewTitle.textContent = meta.title;
  viewIntroCopy.textContent = meta.intro;

  if (view === "pages" && !activePageData) loadPage(activePageKey);
  if (view === "pages" && !pageWorkflowIndexed) loadPageWorkflowIndex();
  if (view === "journal" && !blogPayloadData) loadJournal();
  if (view === "storefront" && !storefrontData) loadStorefront();
  if (view === "settings" && !settingsData) loadSettings();
  if (view === "media" && !mediaData) loadMedia();
  if (view === "media" && mediaData) renderMediaPanel();
};

navItems.forEach((item) => {
  item.addEventListener("click", () => setView(item.dataset.view));
});

rowActions.forEach((item) => {
  item.addEventListener("click", () => setView(item.dataset.viewTarget));
});

const triggerJournalCreate = () => {
  setView("journal");
  if (blogPayloadData) {
    createJournalPost();
    return;
  }
  pendingJournalCreate = true;
};

createPostButton.addEventListener("click", triggerJournalCreate);
if (exitWorkspaceButton) {
  exitWorkspaceButton.addEventListener("click", () => {
    clearWorkspaceAccess();
    window.location.replace("/cms/");
  });
}
journalCreateButton.addEventListener("click", triggerJournalCreate);
journalDeleteButton.addEventListener("click", deleteJournalPost);

pageDraftButton.addEventListener("click", () => saveDraft("page", activePageKey, activePageData, updatePageStatus));
pageResetButton.addEventListener("click", resetPage);
pageDownloadButton.addEventListener("click", () => downloadJson(`${activePageKey}.json`, activePageData, updatePageStatus));
pageFileSaveButton.addEventListener("click", () =>
  saveJsonToFile(
    `${activePageKey}.json`,
    activePageData,
    updatePageStatus,
    () => activePageFileHandle,
    (handle) => {
      activePageFileHandle = handle;
    }
  )
);

journalDraftButton.addEventListener("click", () => saveDraft("journal", "posts", blogPayloadData, updateJournalStatus));
journalResetButton.addEventListener("click", resetJournal);
journalDownloadButton.addEventListener("click", () => downloadJson("posts.json", blogPayloadData, updateJournalStatus));
journalFileSaveButton.addEventListener("click", () =>
  saveJsonToFile(
    "posts.json",
    blogPayloadData,
    updateJournalStatus,
    () => activePostFileHandle,
    (handle) => {
      activePostFileHandle = handle;
    }
  )
);

storefrontDraftButton.addEventListener("click", () =>
  saveDraft("storefront", "page", storefrontData, updateStorefrontStatus)
);
storefrontCreateButton.addEventListener("click", () => {
  setView("storefront");
  if (storefrontData) {
    createStorefrontItem();
    return;
  }
  pendingStorefrontCreate = true;
});
storefrontDeleteButton.addEventListener("click", deleteStorefrontItem);
storefrontResetButton.addEventListener("click", resetStorefront);
storefrontDownloadButton.addEventListener("click", () =>
  downloadJson("storefront.json", storefrontData, updateStorefrontStatus)
);
storefrontFileSaveButton.addEventListener("click", () =>
  saveJsonToFile(
    "storefront.json",
    storefrontData,
    updateStorefrontStatus,
    () => activeStorefrontFileHandle,
    (handle) => {
      activeStorefrontFileHandle = handle;
    }
  )
);

settingsDraftButton.addEventListener("click", () =>
  saveDraft("settings", "site", settingsData, updateSettingsStatus)
);
settingsResetButton.addEventListener("click", resetSettings);
settingsDownloadButton.addEventListener("click", () =>
  downloadJson("settings.json", settingsData, updateSettingsStatus)
);
settingsFileSaveButton.addEventListener("click", () =>
  saveJsonToFile(
    "settings.json",
    settingsData,
    updateSettingsStatus,
    () => activeSettingsFileHandle,
    (handle) => {
      activeSettingsFileHandle = handle;
    }
  )
);

mediaDraftButton.addEventListener("click", () => saveDraft("media", "library", mediaData, updateMediaStatus));
mediaResetButton.addEventListener("click", resetMedia);
mediaDownloadButton.addEventListener("click", () => downloadJson("media.json", mediaData, updateMediaStatus));
mediaFileSaveButton.addEventListener("click", () =>
  saveJsonToFile(
    "media.json",
    mediaData,
    updateMediaStatus,
    () => activeMediaFileHandle,
    (handle) => {
      activeMediaFileHandle = handle;
    }
  )
);

window.addEventListener("beforeunload", (event) => {
  if (!hasUnsavedChanges) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
});

renderPagesList();
setView("overview");
