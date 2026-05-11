const pageSurfaces = [
  {
    key: "home",
    title: "Homepage",
    source: "../../content/site/home.json",
    route: "../../index.html",
    summary: "Hero, positioning, storefront lead-in, and growth narrative.",
  },
  {
    key: "about",
    title: "About",
    source: "../../content/site/about.json",
    route: "../../about.html",
    summary: "Brand identity, values, structure, and mission.",
  },
  {
    key: "projects",
    title: "Projects",
    source: "../../content/site/projects.json",
    route: "../../projects.html",
    summary: "Current pipeline, solution roadmap, and product logic.",
  },
  {
    key: "storefront",
    title: "Storefront",
    source: "../../content/site/storefront.json",
    route: "../../storefront.html",
    summary: "Digital offers, early access, and future product direction.",
  },
  {
    key: "journey",
    title: "Journey",
    source: "../../content/site/journey.json",
    route: "../../journey.html",
    summary: "Learning path, documentation, milestones, and direction.",
  },
  {
    key: "tech-stack",
    title: "Tech Stack",
    source: "../../content/site/tech-stack.json",
    route: "../../tech-stack.html",
    summary: "Primary tools, supporting tools, and technical story.",
  },
  {
    key: "certifications",
    title: "Certifications",
    source: "../../content/site/certifications.json",
    route: "../../certifications.html",
    summary: "Credibility signals, milestones, and growth proof.",
  },
  {
    key: "contact",
    title: "Contact",
    source: "../../content/site/contact.json",
    route: "../../contact.html",
    summary: "Lead capture, inbox messaging, and outreach guidance.",
  },
];

const storefrontOffers = [
  {
    title: "Cyber Ascend",
    image: "../../assets/graphics/cyber-ascend-card.svg",
    summary: "Career transition system for IT professionals moving into cybersecurity.",
    state: "Current Product",
  },
  {
    title: "AI Toolkit",
    image: "../../assets/graphics/ai-toolkit-card.svg",
    summary: "Practical AI workflow product for stronger output and clearer execution.",
    state: "Current Product",
  },
  {
    title: "Resume Kit",
    image: "../../assets/graphics/resume-kit-card.svg",
    summary: "Job acquisition support product focused on positioning and presentation.",
    state: "Current Product",
  },
  {
    title: "CaribAI Apps",
    image: "../../assets/graphics/caribai-apps-card.svg",
    summary: "Future apps and micro SaaS directions that grow from validated demand.",
    state: "Future Direction",
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

const journalList = document.getElementById("journalList");
const journalEditorTitle = document.getElementById("journalEditorTitle");
const journalEditorSummary = document.getElementById("journalEditorSummary");
const journalEditorStatus = document.getElementById("journalEditorStatus");
const journalEditorToolbar = document.getElementById("journalEditorToolbar");
const journalEditorSource = document.getElementById("journalEditorSource");
const journalEditorForm = document.getElementById("journalEditorForm");
const journalFileSaveButton = document.getElementById("journalFileSaveButton");
const journalResetButton = document.getElementById("journalResetButton");
const journalDraftButton = document.getElementById("journalDraftButton");
const journalDownloadButton = document.getElementById("journalDownloadButton");

const storefrontList = document.getElementById("storefrontList");

let activePageKey = pageSurfaces[0].key;
let activePageOriginal = null;
let activePageData = null;
let activeSectionKey = null;
let activePageFileHandle = null;

let blogPayloadOriginal = null;
let blogPayloadData = null;
let activePostSlug = null;
let activePostFileHandle = null;

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const getSurface = (pageKey) => pageSurfaces.find((surface) => surface.key === pageKey);

const humanizeKey = (value) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const setNestedValue = (obj, path, nextValue) => {
  let cursor = obj;
  for (let index = 0; index < path.length - 1; index += 1) {
    cursor = cursor[path[index]];
  }
  cursor[path[path.length - 1]] = nextValue;
};

const findPost = (slug) => blogPayloadData?.posts?.find((post) => post.slug === slug);

const updatePageStatus = (message) => {
  pageEditorStatus.textContent = message;
};

const updateJournalStatus = (message) => {
  journalEditorStatus.textContent = message;
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
    input.addEventListener("change", () => {
      onChange(path, input.checked);
    });

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

  Object.entries(value).forEach(([childKey, childValue]) => {
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

const renderPagesList = () => {
  pagesList.innerHTML = pageSurfaces
    .map(
      (page) => `
        <button class="page-list-item ${page.key === activePageKey ? "is-active" : ""}" data-page-key="${page.key}" type="button">
          <strong>${page.title}</strong>
          <span>${page.summary}</span>
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
  const sections = Object.keys(activePageData);
  const sectionKey = activeSectionKey && sections.includes(activeSectionKey) ? activeSectionKey : sections[0];
  activeSectionKey = sectionKey;

  pageEditorTitle.textContent = surface.title;
  pageEditorSummary.textContent = surface.summary;
  pageEditorSource.textContent = surface.source;
  pageEditorToolbar.hidden = false;
  pageSectionTabs.hidden = false;

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
      updatePageStatus("Draft in progress");
    },
    renderPageEditor
  );

  pageEditorForm.innerHTML = "";
  pageEditorForm.appendChild(fieldStack);
};

const loadPage = async (pageKey) => {
  const surface = getSurface(pageKey);
  if (!surface) {
    return;
  }

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
  activePageOriginal = deepClone(payload);
  const storedDraft = localStorage.getItem(draftStorageKey("page", pageKey));
  activePageData = storedDraft ? JSON.parse(storedDraft) : deepClone(payload);
  updatePageStatus(storedDraft ? "Draft loaded" : "Loaded");
  renderPagesList();
  renderPageEditor();
};

const saveDraft = (scope, key, data, setStatus) => {
  if (!data || !key) {
    return;
  }

  localStorage.setItem(draftStorageKey(scope, key), JSON.stringify(data, null, 2));
  setStatus("Draft saved");
};

const saveJsonToFile = async (data, setStatus, getHandle, setHandle) => {
  if (!data) {
    return;
  }

  if (!window.showOpenFilePicker) {
    setStatus("Direct file save is not supported here");
    return;
  }

  try {
    let handle = getHandle();
    if (!handle) {
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
      setHandle(handle);
    }

    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
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
  if (!data) {
    return;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("JSON exported");
};

const renderJournalList = () => {
  const posts = blogPayloadData?.posts || [];

  journalList.innerHTML = posts
    .map(
      (post) => `
        <button class="page-list-item ${post.slug === activePostSlug ? "is-active" : ""}" data-post-slug="${post.slug}" type="button">
          <strong>${post.title}</strong>
          <span>${post.category || "Uncategorized"}</span>
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
    journalEditorForm.innerHTML = '<div class="editor-empty">No posts are available to edit yet.</div>';
    return;
  }

  const post = findPost(activePostSlug) || blogPayloadData.posts[0];
  activePostSlug = post.slug;
  renderJournalList();

  journalEditorTitle.textContent = post.title;
  journalEditorSummary.textContent = post.excerpt || "Edit this post’s publishing data and article content.";
  journalEditorSource.textContent = "../../content/blog/posts.json";
  journalEditorToolbar.hidden = false;

  const fieldStack = document.createElement("div");
  fieldStack.className = "field-stack";
  renderValueEditor(
    fieldStack,
    post,
    ["posts", blogPayloadData.posts.findIndex((item) => item.slug === post.slug)],
    "Post",
    (path, nextValue) => {
      setNestedValue(blogPayloadData, path, nextValue);
      updateJournalStatus("Draft in progress");
      if (path[path.length - 1] === "slug") {
        activePostSlug = nextValue || activePostSlug;
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
  const response = await fetch("../../content/blog/posts.json", { cache: "no-store" });

  if (!response.ok) {
    journalEditorTitle.textContent = "Journal";
    journalEditorSummary.textContent = "The posts source could not be loaded.";
    updateJournalStatus("Load failed");
    journalEditorToolbar.hidden = true;
    journalEditorForm.innerHTML = '<div class="editor-empty">Unable to load the journal source right now.</div>';
    return;
  }

  const payload = await response.json();
  blogPayloadOriginal = deepClone(payload);
  const storedDraft = localStorage.getItem(draftStorageKey("journal", "posts"));
  blogPayloadData = storedDraft ? JSON.parse(storedDraft) : deepClone(payload);
  activePostSlug = blogPayloadData.posts?.[0]?.slug || null;
  updateJournalStatus(storedDraft ? "Draft loaded" : "Loaded");
  renderJournalList();
  renderJournalEditor();
};

const resetPage = () => {
  if (!activePageOriginal) {
    return;
  }
  activePageData = deepClone(activePageOriginal);
  localStorage.removeItem(draftStorageKey("page", activePageKey));
  updatePageStatus("Reset to source");
  renderPageEditor();
};

const resetJournal = () => {
  if (!blogPayloadOriginal) {
    return;
  }
  blogPayloadData = deepClone(blogPayloadOriginal);
  localStorage.removeItem(draftStorageKey("journal", "posts"));
  activePostSlug = blogPayloadData.posts?.[0]?.slug || null;
  updateJournalStatus("Reset to source");
  renderJournalList();
  renderJournalEditor();
};

const renderStorefront = () => {
  storefrontList.innerHTML = storefrontOffers
    .map(
      (offer) => `
        <article class="offer-row">
          <div class="offer-row-main">
            <img src="${offer.image}" alt="${offer.title} visual" />
            <div>
              <h3>${offer.title}</h3>
              <p>${offer.summary}</p>
              <div class="table-meta">
                <span class="badge">${offer.state}</span>
              </div>
            </div>
          </div>
          <button class="row-action" type="button">Edit</button>
        </article>
      `
    )
    .join("");
};

const setView = (view) => {
  const meta = viewMeta[view] || viewMeta.overview;

  navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.view === view);
  });

  viewPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.viewPanel === view);
  });

  viewEyebrow.textContent = meta.eyebrow;
  viewTitle.textContent = meta.title;
  viewIntroCopy.textContent = meta.intro;

  if (view === "pages" && !activePageData) {
    loadPage(activePageKey);
  }

  if (view === "journal" && !blogPayloadData) {
    loadJournal();
  }
};

navItems.forEach((item) => {
  item.addEventListener("click", () => setView(item.dataset.view));
});

rowActions.forEach((item) => {
  item.addEventListener("click", () => setView(item.dataset.viewTarget));
});

pageDraftButton.addEventListener("click", () => saveDraft("page", activePageKey, activePageData, updatePageStatus));
pageResetButton.addEventListener("click", resetPage);
pageDownloadButton.addEventListener("click", () => downloadJson(`${activePageKey}.json`, activePageData, updatePageStatus));
pageFileSaveButton.addEventListener("click", () =>
  saveJsonToFile(
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
    blogPayloadData,
    updateJournalStatus,
    () => activePostFileHandle,
    (handle) => {
      activePostFileHandle = handle;
    }
  )
);

renderPagesList();
renderStorefront();
setView("overview");
