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

const renderMedia = (item, className = "card-media") => {
  if (item?.video) {
    return `<video class="${className}" controls preload="metadata" src="${item.video}"></video>`;
  }

  if (item?.image) {
    const alt = item.imageAlt || item.title || item.name || "CaribAI media";
    return `<img class="${className}" src="${item.image}" alt="${alt}" />`;
  }

  return "";
};

const renderButtons = (items = []) =>
  items
    .map(
      (item) =>
        `<a class="button ${item.variant === "secondary" ? "button-secondary" : "button-primary"}" href="${
          item.href || "#"
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
        <input type="text" name="name" placeholder="${config.namePlaceholder || "Your name"}" />
      </label>
      <label>
        Email
        <input type="email" name="email" placeholder="${config.emailPlaceholder || "you@example.com"}" />
      </label>
      ${
        includesTopic
          ? `<label>
              You’re reaching out about
              <input type="text" name="company" placeholder="${config.topicPlaceholder || "Partnership, product, media, launch, collaboration..."}" />
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
  return `
    <section class="hero panel">
      <div class="hero-copy">
        <p class="eyebrow">${data.hero?.eyebrow || ""}</p>
        <h1>${data.hero?.title || ""}</h1>
        <p class="hero-text">${data.hero?.description || ""}</p>
        <div class="hero-actions">${renderButtons(data.hero?.actions)}</div>
        <ul class="hero-points">${renderHeroPoints(data.hero?.points)}</ul>
      </div>
      <div class="hero-card-grid">${renderMetricCards(data.hero?.metrics)}</div>
    </section>

    <section class="panel showcase-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Featured Visuals</p>
          <h2>Product concepts presented with a more premium, high-tech feel.</h2>
        </div>
        <p class="section-copy">CaribAI is moving toward sharper visual packaging, stronger launch presentation, and more polished digital product storytelling.</p>
      </div>
      ${renderHeroShowcase(data.storefront?.items)}
    </section>

    <section class="panel split-section">
      <div>
        <p class="eyebrow">${data.positioning?.eyebrow || ""}</p>
        <h2>${data.positioning?.title || ""}</h2>
      </div>
      <p class="section-copy">${data.positioning?.description || ""}</p>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.structure?.eyebrow || ""}</p>
          <h2>${data.structure?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.structure?.description || ""}</p>
      </div>
      <div class="structure-grid">${renderStructureCards(data.structure?.items)}</div>
    </section>

    <section id="storefront" class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.storefront?.eyebrow || ""}</p>
          <h2>${data.storefront?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.storefront?.description || ""}</p>
      </div>
      <div class="storefront-grid">${renderStoreCards(data.storefront?.items)}</div>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.build?.eyebrow || ""}</p>
          <h2>${data.build?.title || ""}</h2>
        </div>
      </div>
      <div class="capability-grid">${renderCapabilityCards(data.build?.items)}</div>
    </section>

    <section class="panel insights-panel">
      <div>
        <p class="eyebrow">${data.businessModel?.eyebrow || ""}</p>
        <h2>${data.businessModel?.title || ""}</h2>
      </div>
      <div class="insight-grid">${renderInsightCards(data.businessModel?.items)}</div>
    </section>

    <section id="projects" class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.execution?.eyebrow || ""}</p>
          <h2>${data.execution?.title || ""}</h2>
        </div>
        ${
          data.execution?.link
            ? `<a class="text-link" href="${data.execution.link.href || "#"}">${data.execution.link.label || "Learn more"}</a>`
            : ""
        }
      </div>
      <div class="project-list">${renderProjectRows(data.execution?.items)}</div>
    </section>

    <section class="panel insights-panel">
      <div>
        <p class="eyebrow">${data.lens?.eyebrow || ""}</p>
        <h2>${data.lens?.title || ""}</h2>
      </div>
      <div class="insight-grid">${renderInsightCards(data.lens?.items)}</div>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.growthHub?.eyebrow || ""}</p>
          <h2>${data.growthHub?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.growthHub?.description || ""}</p>
      </div>
      <div class="capability-grid">${renderCapabilityCards(data.growthHub?.items)}</div>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.focus?.eyebrow || ""}</p>
          <h2>${data.focus?.title || ""}</h2>
        </div>
      </div>
      <div class="project-list">${renderProjectRows(data.focus?.items)}</div>
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

    <section class="panel split-section">
      <div>
        <p class="eyebrow">${data.identity?.eyebrow || ""}</p>
        <h2>${data.identity?.title || ""}</h2>
      </div>
      <p class="section-copy">${data.identity?.description || ""}</p>
    </section>

    <section class="panel">
      <div class="capability-grid">${renderCapabilityCards(data.values?.items)}</div>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.structure?.eyebrow || ""}</p>
          <h2>${data.structure?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.structure?.description || ""}</p>
      </div>
      <div class="structure-grid">${renderStructureCards(data.structure?.items)}</div>
    </section>

    <section class="panel contact-banner">
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
  return `
    ${renderPageHero(data.hero)}

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.pipeline?.eyebrow || ""}</p>
          <h2>${data.pipeline?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.pipeline?.description || ""}</p>
      </div>
      <div class="storefront-grid">${renderStoreCards(data.pipeline?.items)}</div>
    </section>

    <section class="panel">
      <div class="capability-grid">${renderCapabilityCards(data.summary?.items)}</div>
    </section>

    <section class="panel contact-banner">
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
  return `
    ${renderPageHero(data.hero)}

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.products?.eyebrow || ""}</p>
          <h2>${data.products?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.products?.description || ""}</p>
      </div>
      <div class="storefront-grid">${renderStoreCards(data.products?.items)}</div>
    </section>

    <section class="panel">
      <div class="capability-grid">${renderCapabilityCards(data.summary?.items)}</div>
    </section>

    <section class="panel lead-panel">
      <div>
        <p class="eyebrow">${data.lead?.eyebrow || ""}</p>
        <h2>${data.lead?.title || ""}</h2>
        <p class="section-copy">${data.lead?.description || ""}</p>
      </div>
      ${renderForm({
        type: "storefront-access",
        buttonLabel: data.lead?.buttonLabel || "Join Early Access",
        successMessage: data.lead?.successMessage,
        note: data.lead?.note,
      })}
    </section>

    <section class="panel contact-banner">
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

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.focus?.eyebrow || ""}</p>
          <h2>${data.focus?.title || ""}</h2>
        </div>
      </div>
      <div class="capability-grid">${renderCapabilityCards(data.focus?.items)}</div>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.documentation?.eyebrow || ""}</p>
          <h2>${data.documentation?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.documentation?.description || ""}</p>
      </div>
      <div class="project-list">${renderProjectRows(data.documentation?.items)}</div>
    </section>

    <section class="panel insights-panel">
      <div>
        <p class="eyebrow">${data.future?.eyebrow || ""}</p>
        <h2>${data.future?.title || ""}</h2>
      </div>
      <div class="insight-grid">${renderInsightCards(data.future?.items)}</div>
    </section>

    <section class="panel contact-banner">
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

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.primary?.eyebrow || ""}</p>
          <h2>${data.primary?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.primary?.description || ""}</p>
      </div>
      <div class="tool-grid">${renderToolCards(data.primary?.items)}</div>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.secondary?.eyebrow || ""}</p>
          <h2>${data.secondary?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.secondary?.description || ""}</p>
      </div>
      <div class="tool-grid">${renderToolCards(data.secondary?.items)}</div>
    </section>

    <section class="panel insights-panel">
      <div>
        <p class="eyebrow">${data.support?.eyebrow || ""}</p>
        <h2>${data.support?.title || ""}</h2>
      </div>
      <div class="insight-grid">${renderInsightCards(data.support?.items)}</div>
    </section>

    <section class="panel contact-banner">
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

    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.status?.eyebrow || ""}</p>
          <h2>${data.status?.title || ""}</h2>
        </div>
        <p class="section-copy">${data.status?.description || ""}</p>
      </div>
      <div class="project-list">${renderProjectRows(data.status?.items)}</div>
    </section>

    <section class="panel">
      <div class="capability-grid">${renderCapabilityCards(data.summary?.items)}</div>
    </section>

    <section class="panel contact-banner">
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

    <section class="panel contact-grid">
      <div class="contact-info">
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
        className: "contact-form",
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

    const data = await response.json();
    page.innerHTML = config.render(data);
  } catch (error) {
    console.error(error);
  }
};

initSiteContent();
