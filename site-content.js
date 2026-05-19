const SITE_PAGE_CONFIG = {
  home: {
    path: "content/site/home.json",
    render: renderHomePage,
  },
  about: {
    path: "content/site/about.json",
    render: renderAboutPage,
  },
  projects: {
    path: "content/site/projects.json",
    render: renderProjectsPage,
  },
  storefront: {
    path: "content/site/storefront.json",
    render: renderStorefrontPage,
  },
  journey: {
    path: "content/site/journey.json",
    render: renderJourneyPage,
  },
  tech_stack: {
    path: "content/site/tech-stack.json",
    render: renderTechStackPage,
  },
  certifications: {
    path: "content/site/certifications.json",
    render: renderCertificationsPage,
  },
  contact: {
    path: "content/site/contact.json",
    render: renderContactPage,
  },
};

const escapeHTML = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const urlLikeKeys = new Set([
  "href",
  "image",
  "video",
  "logo",
  "logosrc",
  "homehref",
  "path",
  "coverimage",
  "covervideo",
]);

const safeUrl = (value, fallback = "#") => {
  const candidate = String(value ?? "").trim();
  if (!candidate) return fallback;

  if (
    candidate.startsWith("/") ||
    candidate.startsWith("./") ||
    candidate.startsWith("../") ||
    candidate.startsWith("#") ||
    candidate.startsWith("?")
  ) {
    return candidate;
  }

  if (/^(https?:|mailto:|tel:)/i.test(candidate)) {
    return candidate;
  }

  if (/^[a-z0-9][a-z0-9/_\-.]*$/i.test(candidate)) {
    return candidate;
  }

  return fallback;
};

const sanitizeRenderableData = (value, key = "") => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeRenderableData(item, key));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeRenderableData(entryValue, entryKey),
      ])
    );
  }

  if (typeof value === "string") {
    return urlLikeKeys.has(String(key).toLowerCase()) ? safeUrl(value) : escapeHTML(value);
  }

  return value;
};

const normalizeWorkflowStatus = (value) => {
  const status = String(value || "").toLowerCase();
  return status === "draft" || status === "ready" || status === "live" ? status : "live";
};

const filterLiveItems = (items = []) => {
  const collection = Array.isArray(items) ? items : [];
  const liveItems = collection.filter((item) => normalizeWorkflowStatus(item?.workflowStatus) === "live");
  return liveItems.length ? liveItems : collection;
};

const enhanceRevealMotion = (root = document) => {
  const targets = Array.from(
    root.querySelectorAll(
      ".panel, .store-card, .capability-card, .project-row, .tool-card, .structure-card, .metric-card, .hero-mini-card, .hero-stat-card, .hero-command-card, .hero-proof-card, .story-chip-card, .roadmap-step, .operating-model-card, .focus-card, .focus-narrative, .product-spotlight, .product-stack-card"
    )
  );

  if (!targets.length) {
    return;
  }

  targets.forEach((node, index) => {
    node.classList.add("reveal");
    node.style.setProperty("--reveal-delay", `${Math.min(index * 45, 320)}ms`);
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  targets.forEach((node) => observer.observe(node));
};

const renderMedia = (item, className = "card-media") => {
  if (item?.video) {
    return `<video class="${className}" controls preload="metadata" src="${safeUrl(item.video)}"></video>`;
  }

  if (item?.image) {
    const alt = item.imageAlt || item.title || item.name || "CaribAI media";
    return `<img class="${className}" src="${safeUrl(item.image)}" alt="${alt}" />`;
  }

  return "";
};

const renderButtons = (items = []) =>
  items
    .map(
      (item) =>
        `<a class="button ${item.variant === "secondary" ? "button-secondary" : "button-primary"}" href="${
          safeUrl(item.href || "#")
        }">${item.label || "Learn More"}</a>`
    )
    .join("");

const renderHeroShowcase = (items = []) => {
  const featured = items.find((item) => item.featured) || items[0];
  const secondary = items.filter((item) => item !== featured).slice(0, 2);

  if (!featured) {
    return "";
  }

  return `
    <div class="hero-showcase">
      <div class="hero-showcase-main">
        ${renderMedia(featured, "hero-showcase-media")}
        <div class="hero-showcase-copy">
          <span class="pill">${featured.badge || "Featured"}</span>
          <h3>${featured.title || ""}</h3>
          <p>${featured.description || ""}</p>
          ${
            featured.meta?.length
              ? `<div class="card-meta">${featured.meta.map((meta) => `<span>${meta}</span>`).join("")}</div>`
              : ""
          }
        </div>
      </div>
      <div class="hero-showcase-secondary">
        ${secondary
          .map(
            (item) => `
              <article class="hero-mini-card">
                ${renderMedia(item, "hero-mini-media")}
                <div>
                  <span class="pill muted">${item.badge || "Signal"}</span>
                  <h4>${item.title || ""}</h4>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;
};

const renderPageHero = (hero = {}) => {
  const media = renderMedia(hero, "page-hero-media");

  if (!media) {
    return `
      <section class="panel page-hero">
        <p class="eyebrow">${hero.eyebrow || ""}</p>
        <h1>${hero.title || ""}</h1>
        <p class="section-copy">${hero.description || ""}</p>
      </section>
    `;
  }

  return `
    <section class="panel page-hero page-hero-rich">
      <div class="page-hero-layout">
        <div>
          <p class="eyebrow">${hero.eyebrow || ""}</p>
          <h1>${hero.title || ""}</h1>
          <p class="section-copy">${hero.description || ""}</p>
        </div>
        <div class="page-hero-visual">
          ${media}
        </div>
      </div>
    </section>
  `;
};

const renderHeroPoints = (items = []) =>
  items.map((item) => `<li>${item}</li>`).join("");

const renderMetricCards = (items = []) =>
  items
    .map(
      (item) => `
        <article class="metric-card ${item.featured ? "glow-card" : ""}">
          <span class="label">${item.label || "Highlight"}</span>
          <strong>${item.title || ""}</strong>
          <p>${item.description || ""}</p>
        </article>
      `
    )
    .join("");

const renderStoreCards = (items = []) =>
  items
    .map(
      (item) => `
        <article class="store-card ${item.featured ? "featured" : ""}">
          ${renderMedia(item)}
          <span class="pill ${item.muted ? "muted" : ""}">${item.badge || "Product"}</span>
          <h3>${item.title || ""}</h3>
          <p>${item.description || ""}</p>
          ${
            item.meta?.length
              ? `<div class="card-meta">${item.meta.map((meta) => `<span>${meta}</span>`).join("")}</div>`
              : ""
          }
        </article>
      `
    )
    .join("");

const renderCapabilityCards = (items = []) =>
  items
    .map(
      (item) => `
        <article class="capability-card">
          ${renderMedia(item)}
          <h3>${item.title || ""}</h3>
          <p>${item.description || ""}</p>
          ${item.href ? `<a class="text-link" href="${item.href}">${item.linkLabel || "Learn more"}</a>` : ""}
        </article>
      `
    )
    .join("");

const renderInsightCards = (items = []) =>
  items
    .map(
      (item) => `
        <article>
          <h3>${item.title || ""}</h3>
          <p>${item.description || ""}</p>
        </article>
      `
    )
    .join("");

const renderEmptySurface = (title, description) => `
  <article class="editorial-empty-card">
    <span class="pill muted">Waiting on content</span>
    <h3>${title}</h3>
    <p>${description}</p>
  </article>
`;

const renderProjectRows = (items = []) =>
  items
    .map(
      (item) => `
        <article class="project-row">
          <div class="project-row-layout">
            ${item.image ? `<img class="project-row-media" src="${item.image}" alt="${item.imageAlt || item.title || ""}" />` : ""}
            <div>
              <h3>${item.title || ""}</h3>
              <p>${item.description || ""}</p>
            </div>
          </div>
          ${item.status ? `<span>${item.status}</span>` : ""}
        </article>
      `
    )
    .join("");

const renderStructureCards = (items = []) =>
  items
    .map(
      (item) => `
        <article class="structure-card ${item.featured ? "featured-structure" : ""}">
          <span class="pill ${item.muted ? "muted" : ""}">${item.badge || "Section"}</span>
          <h3>${item.title || ""}</h3>
          <p>${item.description || ""}</p>
        </article>
      `
    )
    .join("");

const renderToolCards = (items = []) =>
  items
    .map(
      (item) => `
        <article class="tool-card">
          <div class="tool-card-top">
            ${item.logo ? `<img class="tool-card-logo" src="${item.logo}" alt="${item.title || ""} logo" />` : ""}
            <div>
              <h3>${item.title || ""}</h3>
              ${item.label ? `<span class="pill muted">${item.label}</span>` : ""}
            </div>
          </div>
          <p>${item.description || ""}</p>
        </article>
      `
    )
    .join("");

const renderForm = (config = {}) => {
  const type = config.type || "general";
  const includesTopic = type === "contact";
  const includesMessage = type === "contact";

  return `
    <form
      class="lead-form ${config.className || ""}"
      data-demo-form
      data-form-type="${type}"
      data-success-message="${config.successMessage || "Your email app should open with a ready-to-send message for CaribAI."}"
    >
      <label>
        Name
        <input type="text" name="name" placeholder="${config.namePlaceholder || "Your name"}" autocomplete="name" required />
      </label>
      <label>
        Email
        <input type="email" name="email" placeholder="${config.emailPlaceholder || "you@example.com"}" autocomplete="email" inputmode="email" required />
      </label>
      ${
        includesTopic
          ? `<label>
              You’re reaching out about
              <input type="text" name="company" placeholder="${config.topicPlaceholder || "Partnership, product, media, launch, collaboration..."}" autocomplete="organization-title" />
            </label>`
          : ""
      }
      ${
        includesMessage
          ? `<label>
              Message
              <textarea name="message" rows="6" placeholder="${config.messagePlaceholder || "Tell me what you’d like to connect about."}"></textarea>
            </label>`
          : ""
      }
      <button class="button button-primary" type="submit">${config.buttonLabel || "Submit"}</button>
      <p class="form-note" data-form-note>${config.note || "This opens a ready-to-send email to the CaribAI inbox for now."}</p>
    </form>
  `;
};

function renderHomePage(data) {
  const heroMetrics = (data.hero?.metrics || []).slice(0, 3);
  const storefrontItems = filterLiveItems(data.storefront?.items || []);
  const featuredProduct = storefrontItems.find((item) => item.featured) || storefrontItems[0];
  const secondaryProducts = storefrontItems.filter((item) => item !== featuredProduct).slice(0, 2);
  const structureItems = data.structure?.items || [];
  const buildItems = data.build?.items || [];
  const modelItems = data.businessModel?.items || [];
  const focusItems = data.focus?.items || [];
  const featuredProductBlock = featuredProduct
    ? `
        <article class="hero-command-card">
          <div class="hero-command-copy">
            <p class="overline-lite">Featured direction</p>
            <h3>${featuredProduct?.title || ""}</h3>
            <p>${featuredProduct?.description || ""}</p>
            ${
              featuredProduct?.meta?.length
                ? `<div class="card-meta">${featuredProduct.meta.map((meta) => `<span>${meta}</span>`).join("")}</div>`
                : ""
            }
          </div>
          ${renderMedia(featuredProduct, "hero-command-media")}
        </article>
      `
    : renderEmptySurface(
        "Featured direction coming next",
        "Publish or mark at least one live storefront offer to populate this homepage spotlight."
      );

  const secondaryProductBlocks = secondaryProducts.length
    ? secondaryProducts
        .map(
          (item) => `
            <article class="hero-proof-card">
              <div>
                <span class="pill muted">${item.badge || "Product"}</span>
                <h4>${item.title || ""}</h4>
              </div>
              <p>${item.description || ""}</p>
            </article>
          `
        )
        .join("")
    : renderEmptySurface(
        "More offers will appear here",
        "As live products are added, this proof stack will fill in automatically."
      );

  return `
    <section class="panel hero-home hero-home-premium">
      <div class="home-hero-grid">
        <div class="hero-copy hero-copy-stack">
          <p class="eyebrow">${data.hero?.eyebrow || ""}</p>
          <h1>${data.hero?.title || ""}</h1>
          <p class="hero-text">${data.hero?.description || ""}</p>
          <div class="hero-actions">${renderButtons(data.hero?.actions)}</div>
          <ul class="hero-points">${renderHeroPoints((data.hero?.points || []).slice(0, 3))}</ul>

          <div class="hero-signal-grid">
            ${heroMetrics
              .map(
                (item) => `
                  <article class="hero-stat-card ${item.featured ? "hero-stat-card-featured" : ""}">
                    <span class="label">${item.label || "Signal"}</span>
                    <strong>${item.title || ""}</strong>
                    <p>${item.description || ""}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="home-hero-side">
        ${featuredProductBlock}

        <div class="hero-proof-list">
          ${secondaryProductBlocks}
        </div>
      </div>
      </div>
    </section>

    <section class="panel home-story-band">
      <div class="home-story-grid">
        <div class="story-lead">
          <p class="eyebrow">${data.positioning?.eyebrow || ""}</p>
          <h2>${data.positioning?.title || ""}</h2>
          <p class="section-copy">${data.positioning?.description || ""}</p>
        </div>
        <div class="story-aside">
          <p class="story-aside-copy">${data.structure?.description || ""}</p>
          <div class="story-chip-list">
            ${structureItems
              .slice(0, 3)
              .map(
                (item) => `
                  <article class="story-chip-card ${item.featured ? "story-chip-card-featured" : ""}">
                    <span class="pill ${item.muted ? "muted" : ""}">${item.badge || "Layer"}</span>
                    <h3>${item.title || ""}</h3>
                    <p>${item.description || ""}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>

    <section id="storefront" class="panel home-products-canvas">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.storefront?.eyebrow || ""}</p>
          <h2>${data.storefront?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.storefront?.description || ""}</p>
      </div>
      <div class="home-products-shell">
        ${
          featuredProduct
            ? `
              <article class="product-spotlight">
                <div class="product-spotlight-copy">
                  <span class="pill">${featuredProduct?.badge || "Current Product"}</span>
                  <h3>${featuredProduct?.title || ""}</h3>
                  <p>${featuredProduct?.description || ""}</p>
                  ${
                    featuredProduct?.meta?.length
                      ? `<div class="card-meta">${featuredProduct.meta.map((meta) => `<span>${meta}</span>`).join("")}</div>`
                      : ""
                  }
                </div>
                <div class="product-spotlight-visual">
                  ${renderMedia(featuredProduct, "product-spotlight-media")}
                </div>
              </article>
            `
            : renderEmptySurface(
                "Storefront spotlight is empty",
                "Mark a storefront product as live to repopulate this section on the homepage."
              )
        }

        <div class="product-stack">
          ${
            secondaryProducts.length
              ? secondaryProducts
                  .map(
                    (item) => `
                      <article class="product-stack-card">
                        ${renderMedia(item, "product-stack-media")}
                        <div>
                          <span class="pill ${item.muted ? "muted" : ""}">${item.badge || "Product"}</span>
                          <h3>${item.title || ""}</h3>
                          <p>${item.description || ""}</p>
                        </div>
                      </article>
                    `
                  )
                  .join("")
              : renderEmptySurface(
                  "Supporting product stack is empty",
                  "Additional live offers will automatically appear here as the storefront grows."
                )
          }
        </div>
      </div>
    </section>

    <section class="panel home-roadmap-premium">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.execution?.eyebrow || ""}</p>
          <h2>${data.execution?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.businessModel?.title || ""}</p>
      </div>
      <div class="home-roadmap-shell">
        <div class="roadmap-track">
          ${data.execution?.items
            ?.map(
              (item) => `
                <article class="roadmap-step">
                  <span class="project-row-status">${item.status || "Phase"}</span>
                  <h3>${item.title || ""}</h3>
                  <p>${item.description || ""}</p>
                </article>
              `
            )
            .join("") || ""}
        </div>

        <div class="operating-model">
          <article class="operating-model-card">
            <p class="eyebrow">${data.build?.eyebrow || ""}</p>
            <h3>${data.build?.title || ""}</h3>
            <div class="operating-model-list">
              ${buildItems
                .map(
                  (item) => `
                    <div class="operating-model-item">
                      <h4>${item.title || ""}</h4>
                      <p>${item.description || ""}</p>
                    </div>
                  `
                )
                .join("")}
            </div>
          </article>

          <article class="operating-model-card operating-model-card-accent">
            <p class="eyebrow">${data.businessModel?.eyebrow || ""}</p>
            <h3>${data.businessModel?.title || ""}</h3>
            <div class="operating-loop">
              ${modelItems
                .map(
                  (item, index) => `
                    <div class="operating-loop-step">
                      <span>${String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h4>${item.title || ""}</h4>
                        <p>${item.description || ""}</p>
                      </div>
                    </div>
                  `
                )
                .join("")}
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="panel home-ecosystem-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.growthHub?.eyebrow || ""}</p>
          <h2>${data.growthHub?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.growthHub?.description || ""}</p>
      </div>
      <div class="ecosystem-grid">
        <div class="capability-grid">${renderCapabilityCards(data.growthHub?.items)}</div>
        <div class="ecosystem-structure">
          <p class="eyebrow">${data.structure?.eyebrow || ""}</p>
          <h3>${data.structure?.title || ""}</h3>
          <div class="structure-stack">
            ${renderStructureCards(structureItems)}
          </div>
        </div>
      </div>
    </section>

    <section id="projects" class="panel home-focus-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.focus?.eyebrow || ""}</p>
          <h2>${data.focus?.title || ""}</h2>
        </div>
        ${
          data.execution?.link
            ? `<a class="text-link" href="${data.execution.link.href || "#"}">${data.execution.link.label || "See all projects"}</a>`
            : ""
        }
      </div>
      <div class="focus-shell">
        <div class="focus-grid">
          ${focusItems
            .map(
              (item) => `
                <article class="focus-card">
                  <span class="project-row-status">${item.status || "Focus"}</span>
                  <h3>${item.title || ""}</h3>
                  <p>${item.description || ""}</p>
                </article>
              `
            )
            .join("")}
        </div>
        <article class="focus-narrative">
          <p class="eyebrow">${data.lens?.eyebrow || "Why it compounds"}</p>
          <h3>${data.lens?.title || ""}</h3>
          <div class="compact-insight-grid">${renderInsightCards(data.lens?.items)}</div>
        </article>
      </div>
    </section>

    <section id="lead-access" class="panel lead-panel">
      <div>
        <p class="eyebrow">${data.lead?.eyebrow || ""}</p>
        <h2>${data.lead?.title || ""}</h2>
        <p class="section-copy">${data.lead?.description || ""}</p>
      </div>
      ${renderForm({
        type: "early-access",
        buttonLabel: data.lead?.buttonLabel || "Join Early Access",
        successMessage: data.lead?.successMessage,
        note: data.lead?.note,
      })}
    </section>

    <section class="panel contact-banner">
      <div>
        <p class="eyebrow">${data.contact?.eyebrow || ""}</p>
        <h2>${data.contact?.title || ""}</h2>
        <p class="section-copy">${data.contact?.description || ""}</p>
      </div>
      <a class="button button-secondary" href="${data.contact?.href || "contact.html"}">${data.contact?.label || "Contact"}</a>
    </section>
  `;
}

function renderAboutPage(data) {
  return `
    ${renderPageHero(data.hero)}

    <section class="panel about-identity-shell">
      <div class="about-identity-grid">
        <div class="about-identity-copy">
          <p class="eyebrow">${data.identity?.eyebrow || ""}</p>
          <h2>${data.identity?.title || ""}</h2>
          <p class="section-copy">${data.identity?.description || ""}</p>
        </div>
        <article class="about-identity-card">
          <p class="overline-lite">How CaribAI operates</p>
          <h3>Problem-first, execution-heavy, system-aware.</h3>
          <p>CaribAI is not being built around vague AI ambition. It is being built around useful systems, visible progress, and technical depth that compounds over time.</p>
        </article>
      </div>
    </section>

    <section class="panel about-values-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Core Direction</p>
          <h2>Mission, vision, and operating lens in one place.</h2>
        </div>
        <p class="section-copy">${data.structure?.description || ""}</p>
      </div>
      <div class="capability-grid">${renderCapabilityCards(data.values?.items)}</div>
    </section>

    <section class="panel about-structure-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.structure?.eyebrow || ""}</p>
          <h2>${data.structure?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.structure?.description || ""}</p>
      </div>
      <div class="about-structure-grid">
        <div class="structure-grid">${renderStructureCards(data.structure?.items)}</div>
        <article class="about-structure-note">
          <p class="overline-lite">Why this matters</p>
          <h3>One visible brand, one deeper build layer.</h3>
          <p>The public site should help people understand that CaribAI sells useful things today while building toward stronger systems, software, and infrastructure later.</p>
        </article>
      </div>
    </section>

    <section class="panel contact-banner about-next-step">
      <div>
        <p class="eyebrow">${data.cta?.eyebrow || ""}</p>
        <h2>${data.cta?.title || ""}</h2>
        <p class="section-copy">${data.cta?.description || ""}</p>
      </div>
      <a class="button button-secondary" href="${data.cta?.href || "projects.html"}">${data.cta?.label || "Explore"}</a>
    </section>
  `;
}

function renderProjectsPage(data) {
  const projects = data.pipeline?.items || [];
  const featuredProject = projects.find((item) => item.featured) || projects[0];
  const secondaryProjects = projects.filter((item) => item !== featuredProject).slice(0, 3);

  return `
    ${renderPageHero(data.hero)}

    <section class="panel projects-pipeline-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.pipeline?.eyebrow || ""}</p>
          <h2>${data.pipeline?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.pipeline?.description || ""}</p>
      </div>
      <div class="storefront-premium-grid">
        ${
          featuredProject
            ? `
              <article class="product-spotlight projects-featured-card">
                <div class="product-spotlight-copy">
                  <span class="pill">${featuredProject?.badge || "Current Product"}</span>
                  <h3>${featuredProject?.title || ""}</h3>
                  <p>${featuredProject?.description || ""}</p>
                  ${
                    featuredProject?.meta?.length
                      ? `<div class="card-meta">${featuredProject.meta.map((meta) => `<span>${meta}</span>`).join("")}</div>`
                      : ""
                  }
                </div>
                <div class="product-spotlight-visual">
                  ${renderMedia(featuredProject, "product-spotlight-media")}
                </div>
              </article>
            `
            : renderEmptySurface(
                "Project spotlight will appear here",
                "Add pipeline items to the projects content source to populate this feature area."
              )
        }

        <div class="product-stack">
          ${
            secondaryProjects.length
              ? secondaryProjects
                  .map(
                    (item) => `
                      <article class="product-stack-card">
                        ${renderMedia(item, "product-stack-media")}
                        <div>
                          <span class="pill ${item.muted ? "muted" : ""}">${item.badge || "Direction"}</span>
                          <h3>${item.title || ""}</h3>
                          <p>${item.description || ""}</p>
                        </div>
                      </article>
                    `
                  )
                  .join("")
              : renderEmptySurface(
                  "Additional project cards will show here",
                  "Add more pipeline entries to create the supporting project stack."
                )
          }
        </div>
      </div>
    </section>

    <section class="panel projects-summary-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Project Logic</p>
          <h2>Each project is a different proof point in the wider ecosystem.</h2>
        </div>
      </div>
      <div class="storefront-summary-grid">
        ${(data.summary?.items || [])
          .map(
            (item) => `
              <article class="storefront-summary-card">
                <h3>${item.title || ""}</h3>
                <p>${item.description || ""}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="panel contact-banner projects-next-step">
      <div>
        <p class="eyebrow">${data.cta?.eyebrow || ""}</p>
        <h2>${data.cta?.title || ""}</h2>
        <p class="section-copy">${data.cta?.description || ""}</p>
      </div>
      <a class="button button-secondary" href="${data.cta?.href || "journey.html"}">${data.cta?.label || "Continue"}</a>
    </section>
  `;
}

function renderStorefrontPage(data) {
  const products = filterLiveItems(data.products?.items || []);
  const featuredProduct = products.find((item) => item.featured) || products[0];
  const secondaryProducts = products.filter((item) => item !== featuredProduct).slice(0, 3);

  return `
    ${renderPageHero(data.hero)}

    <section class="panel storefront-products-premium">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.products?.eyebrow || ""}</p>
          <h2>${data.products?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.products?.description || ""}</p>
      </div>
      <div class="storefront-premium-grid">
        ${
          featuredProduct
            ? `
              <article class="product-spotlight storefront-featured-card">
                <div class="product-spotlight-copy">
                  <span class="pill">${featuredProduct?.badge || "Current Product"}</span>
                  <h3>${featuredProduct?.title || ""}</h3>
                  <p>${featuredProduct?.description || ""}</p>
                  ${
                    featuredProduct?.meta?.length
                      ? `<div class="card-meta">${featuredProduct.meta.map((meta) => `<span>${meta}</span>`).join("")}</div>`
                      : ""
                  }
                </div>
                <div class="product-spotlight-visual">
                  ${renderMedia(featuredProduct, "product-spotlight-media")}
                </div>
              </article>
            `
            : renderEmptySurface(
                "No live storefront offer yet",
                "Make at least one storefront item live to populate this page’s featured commerce area."
              )
        }

        <div class="product-stack storefront-product-stack">
          ${
            secondaryProducts.length
              ? secondaryProducts
                  .map(
                    (item) => `
                      <article class="product-stack-card storefront-product-card">
                        ${renderMedia(item, "product-stack-media")}
                        <div>
                          <span class="pill ${item.muted ? "muted" : ""}">${item.badge || "Product"}</span>
                          <h3>${item.title || ""}</h3>
                          <p>${item.description || ""}</p>
                          ${
                            item.meta?.length
                              ? `<div class="card-meta">${item.meta.map((meta) => `<span>${meta}</span>`).join("")}</div>`
                              : ""
                          }
                        </div>
                      </article>
                    `
                  )
                  .join("")
              : renderEmptySurface(
                  "Supporting offers will appear here",
                  "Additional live storefront items will populate the supporting offer column."
                )
          }
        </div>
      </div>
    </section>

    <section class="panel storefront-summary-premium">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Storefront Logic</p>
          <h2>Built to show what is usable now and what can grow later.</h2>
        </div>
        <p class="section-copy">${data.summary?.items?.[0]?.description || ""}</p>
      </div>
      <div class="storefront-summary-grid">
        ${(data.summary?.items || [])
          .map(
            (item) => `
              <article class="storefront-summary-card">
                <h3>${item.title || ""}</h3>
                <p>${item.description || ""}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="panel lead-panel storefront-access-premium">
      <div class="storefront-access-copy">
        <p class="eyebrow">${data.lead?.eyebrow || ""}</p>
        <h2>${data.lead?.title || ""}</h2>
        <p class="section-copy">${data.lead?.description || ""}</p>
        <div class="compact-insight-grid storefront-access-notes">
          <article>
            <h3>Early signal matters.</h3>
            <p>Join the list if you want first access to digital releases, experiments, and future software directions.</p>
          </article>
          <article>
            <h3>Watch the progression.</h3>
            <p>The storefront will evolve from focused offers into stronger tools, automation layers, and AI products over time.</p>
          </article>
        </div>
      </div>
      ${renderForm({
        type: "storefront-access",
        buttonLabel: data.lead?.buttonLabel || "Join Early Access",
        successMessage: data.lead?.successMessage,
        note: data.lead?.note,
      })}
    </section>

    <section class="panel contact-banner storefront-next-step">
      <div>
        <p class="eyebrow">${data.cta?.eyebrow || ""}</p>
        <h2>${data.cta?.title || ""}</h2>
        <p class="section-copy">${data.cta?.description || ""}</p>
      </div>
      <a class="button button-secondary" href="${data.cta?.href || "journey.html"}">${data.cta?.label || "Continue"}</a>
    </section>
  `;
}

function renderJourneyPage(data) {
  return `
    ${renderPageHero(data.hero)}

    <section class="panel journey-focus-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.focus?.eyebrow || ""}</p>
          <h2>${data.focus?.title || ""}</h2>
        </div>
      </div>
      <div class="capability-grid">${renderCapabilityCards(data.focus?.items)}</div>
    </section>

    <section class="panel journey-documentation-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.documentation?.eyebrow || ""}</p>
          <h2>${data.documentation?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.documentation?.description || ""}</p>
      </div>
      <div class="journey-log-grid">
        ${(data.documentation?.items || [])
          .map(
            (item) => `
              <article class="journey-log-card">
                ${item.image ? `<img class="card-media" src="${item.image}" alt="${item.imageAlt || item.title || ""}" />` : ""}
                <span class="project-row-status">${item.status || "Ongoing"}</span>
                <h3>${item.title || ""}</h3>
                <p>${item.description || ""}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="panel insights-panel journey-future-shell">
      <div>
        <p class="eyebrow">${data.future?.eyebrow || ""}</p>
        <h2>${data.future?.title || ""}</h2>
      </div>
      <div class="journey-future-grid">
        ${(data.future?.items || [])
          .map(
            (item) => `
              <article class="journey-future-card">
                <h3>${item.title || ""}</h3>
                <p>${item.description || ""}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="panel contact-banner journey-next-step">
      <div>
        <p class="eyebrow">${data.cta?.eyebrow || ""}</p>
        <h2>${data.cta?.title || ""}</h2>
        <p class="section-copy">${data.cta?.description || ""}</p>
      </div>
      <a class="button button-secondary" href="${data.cta?.href || "tech-stack.html"}">${data.cta?.label || "Continue"}</a>
    </section>
  `;
}

function renderTechStackPage(data) {
  return `
    ${renderPageHero(data.hero)}

    <section class="panel tech-stack-primary-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.primary?.eyebrow || ""}</p>
          <h2>${data.primary?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.primary?.description || ""}</p>
      </div>
      <div class="tool-grid">${renderToolCards(data.primary?.items)}</div>
    </section>

    <section class="panel tech-stack-secondary-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.secondary?.eyebrow || ""}</p>
          <h2>${data.secondary?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.secondary?.description || ""}</p>
      </div>
      <div class="tool-grid">${renderToolCards(data.secondary?.items)}</div>
    </section>

    <section class="panel insights-panel tech-stack-support-shell">
      <div>
        <p class="eyebrow">${data.support?.eyebrow || ""}</p>
        <h2>${data.support?.title || ""}</h2>
      </div>
      <div class="journey-future-grid">
        ${(data.support?.items || [])
          .map(
            (item) => `
              <article class="journey-future-card">
                <h3>${item.title || ""}</h3>
                <p>${item.description || ""}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="panel contact-banner tech-next-step">
      <div>
        <p class="eyebrow">${data.cta?.eyebrow || ""}</p>
        <h2>${data.cta?.title || ""}</h2>
        <p class="section-copy">${data.cta?.description || ""}</p>
      </div>
      <a class="button button-secondary" href="${data.cta?.href || "certifications.html"}">${data.cta?.label || "Continue"}</a>
    </section>
  `;
}

function renderCertificationsPage(data) {
  return `
    ${renderPageHero(data.hero)}

    <section class="panel certifications-status-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.status?.eyebrow || ""}</p>
          <h2>${data.status?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.status?.description || ""}</p>
      </div>
      <div class="journey-log-grid">
        ${(data.status?.items || [])
          .map(
            (item) => `
              <article class="journey-log-card certification-card">
                ${item.image ? `<img class="card-media" src="${item.image}" alt="${item.imageAlt || item.title || ""}" />` : ""}
                <span class="project-row-status">${item.status || "Status"}</span>
                <h3>${item.title || ""}</h3>
                <p>${item.description || ""}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="panel certifications-summary-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Why it counts</p>
          <h2>Credentials only matter when they strengthen the real work.</h2>
        </div>
      </div>
      <div class="capability-grid">${renderCapabilityCards(data.summary?.items)}</div>
    </section>

    <section class="panel contact-banner certifications-next-step">
      <div>
        <p class="eyebrow">${data.cta?.eyebrow || ""}</p>
        <h2>${data.cta?.title || ""}</h2>
        <p class="section-copy">${data.cta?.description || ""}</p>
      </div>
      <a class="button button-secondary" href="${data.cta?.href || "blog.html"}">${data.cta?.label || "Continue"}</a>
    </section>
  `;
}

function renderContactPage(data) {
  return `
    ${renderPageHero(data.hero)}

    <section class="panel contact-grid contact-shell-premium">
      <div class="contact-info contact-info-premium">
        <h2>${data.info?.title || ""}</h2>
        <ul class="hero-points">${renderHeroPoints(data.info?.items)}</ul>
        ${
          data.info?.boxes?.length
            ? data.info.boxes
                .map(
                  (box) => `
                    <div class="contact-box">
                      <h3>${box.title || ""}</h3>
                      <p>${
                        box.href ? `<a class="text-link" href="${box.href}">${box.description || box.href}</a>` : box.description || ""
                      }</p>
                    </div>
                  `
                )
                .join("")
            : ""
        }
      </div>
      ${renderForm({
        type: "contact",
        className: "contact-form contact-form-premium",
        buttonLabel: data.form?.buttonLabel || "Send Inquiry",
        successMessage: data.form?.successMessage,
        note: data.form?.note,
        topicPlaceholder: data.form?.topicPlaceholder,
        messagePlaceholder: data.form?.messagePlaceholder,
      })}
    </section>
  `;
}

const initSiteContent = async () => {
  const page = document.querySelector("[data-site-page]");
  if (!page) {
    return;
  }

  const pageKey = page.getAttribute("data-site-page");
  const config = SITE_PAGE_CONFIG[pageKey];

  if (!config) {
    return;
  }

  try {
    const response = await fetch(config.path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load content for ${pageKey}.`);
    }

    const data = sanitizeRenderableData(await response.json());
    page.innerHTML = config.render(data);
    enhanceRevealMotion(page.closest(".site-shell") || document);
  } catch (error) {
    console.error(error);
  }
};

initSiteContent();
