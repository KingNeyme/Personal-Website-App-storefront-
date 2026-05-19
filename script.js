const SETTINGS_PATH = "content/site/settings.json";
const defaultInbox = "caribailabs@gmail.com";

let activeInbox = defaultInbox;

const escapeHTML = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const safeUrl = (value, fallback = "#") => {
  const candidate = String(value ?? "").trim();
  if (!candidate) return fallback;

  if (
    candidate.startsWith("/") ||
    candidate.startsWith("./") ||
    candidate.startsWith("../") ||
    candidate.startsWith("#") ||
    candidate.startsWith("?") ||
    /^(https?:|mailto:|tel:)/i.test(candidate) ||
    /^[a-z0-9][a-z0-9/_\-.]*$/i.test(candidate)
  ) {
    return candidate;
  }

  return fallback;
};

const getCurrentPageName = () => {
  const pathname = window.location.pathname.split("/").pop() || "index.html";
  return pathname === "" ? "index.html" : pathname;
};

const applyBrandSettings = (settings = {}) => {
  const homeHref = settings.homeHref || "index.html";
  const logoSrc = settings.logoSrc || "assets/CariAI-LOGO-Transparent.png";
  const logoAlt = settings.logoAlt || "CaribAI logo";
  const footerCopy =
    settings.footerCopy ||
    "AI engineering, intelligent systems, and digital infrastructure built from the Caribbean with global ambition.";

  document.querySelectorAll(".brand").forEach((node) => {
    node.setAttribute("href", safeUrl(homeHref, "index.html"));
    node.setAttribute("aria-label", "CaribAI home");
  });

  document.querySelectorAll(".brand-wordmark, .footer-wordmark").forEach((image) => {
    image.setAttribute("src", safeUrl(logoSrc, "assets/CariAI-LOGO-Transparent.png"));
    image.setAttribute("alt", logoAlt);
  });

  document.querySelectorAll(".footer-copy").forEach((node) => {
    node.textContent = footerCopy;
  });
};

const applyNavSettings = (settings = {}) => {
  const currentPage = getCurrentPageName();
  const links = Array.isArray(settings.links) ? settings.links : [];
  const cta = settings.cta || {};
  const ctaLabel = cta.label || "Contact";
  const ctaHref = cta.href || "contact.html";

  document.querySelectorAll(".nav").forEach((nav) => {
    nav.innerHTML = links
      .map((link) => {
        const href = link.href || "#";
        const isCurrent = href === currentPage;
        return `<a href="${safeUrl(href)}"${isCurrent ? ' aria-current="page"' : ""}>${escapeHTML(link.label || "Link")}</a>`;
      })
      .join("");
  });

  document.querySelectorAll(".nav-cta").forEach((link) => {
    link.textContent = ctaLabel;
    link.setAttribute("href", safeUrl(ctaHref, "contact.html"));
    if (ctaHref === currentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const applyFooterSettings = (settings = {}) => {
  const currentPage = getCurrentPageName();
  const links = Array.isArray(settings.links) ? settings.links : [];

  document.querySelectorAll(".footer-links").forEach((nav) => {
    nav.innerHTML = links
      .map((link) => {
        const href = link.href || "#";
        const isCurrent = href === currentPage;
        return `<a href="${safeUrl(href)}"${isCurrent ? ' aria-current="page"' : ""}>${escapeHTML(link.label || "Link")}</a>`;
      })
      .join("");
  });
};

const applySiteSettings = (payload = {}) => {
  activeInbox = payload.contact?.email || defaultInbox;
  applyBrandSettings(payload.brand || {});
  applyNavSettings(payload.navigation || {});
  applyFooterSettings(payload.footer || {});

  document.querySelectorAll(".footer-meta-link").forEach((node) => {
    node.textContent = activeInbox;
    node.setAttribute("href", `mailto:${activeInbox}`);
  });
};

const initSiteSettings = async () => {
  try {
    const response = await fetch(SETTINGS_PATH, { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    applySiteSettings(payload);
  } catch (error) {
    console.error("Unable to load shared site settings.", error);
  }
};

const initSiteNav = () => {
  const topbar = document.querySelector(".topbar");
  const toggle = document.querySelector(".nav-toggle");
  const navShell = document.querySelector(".nav-shell");
  const nav = document.querySelector(".nav");

  if (!topbar || !toggle || !navShell || !nav) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 980px)");

  if (!toggle.id) {
    toggle.id = "siteNavToggle";
  }
  if (!navShell.id) {
    navShell.id = "siteNavShell";
  }

  toggle.setAttribute("aria-controls", navShell.id);
  toggle.setAttribute("aria-haspopup", "true");

  let isMobileView = mobileQuery.matches;
  let isNavOpen = false;

  const syncNavState = () => {
    const isMobile = mobileQuery.matches;

    if (!isMobile) {
      isNavOpen = false;
      topbar.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      navShell.hidden = false;
      navShell.style.display = "";
      navShell.setAttribute("aria-hidden", "false");
      return;
    }

    navShell.hidden = false;
    topbar.classList.toggle("is-open", isNavOpen);
    toggle.setAttribute("aria-expanded", String(isNavOpen));
    navShell.style.display = isNavOpen ? "flex" : "none";
    navShell.setAttribute("aria-hidden", String(!isNavOpen));
  };

  const closeNav = () => {
    isNavOpen = false;
    syncNavState();
  };

  toggle.addEventListener("click", () => {
    if (!mobileQuery.matches) {
      return;
    }

    isNavOpen = !isNavOpen;
    syncNavState();
  });

  navShell.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  document.addEventListener("click", (event) => {
    if (!topbar.classList.contains("is-open")) {
      return;
    }

    if (!topbar.contains(event.target)) {
      closeNav();
    }
  });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", () => {
      isMobileView = mobileQuery.matches;
      isNavOpen = false;
      syncNavState();
    });
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(() => {
      isMobileView = mobileQuery.matches;
      isNavOpen = false;
      syncNavState();
    });
  }

  window.addEventListener("resize", () => {
    const nextIsMobileView = mobileQuery.matches;
    if (nextIsMobileView !== isMobileView) {
      isMobileView = nextIsMobileView;
      isNavOpen = false;
    }
    syncNavState();
  });

  syncNavState();
};

const buildMailtoLink = (form) => {
  const type = form.getAttribute("data-form-type") || "general";
  const formData = new FormData(form);
  const name = formData.get("name")?.toString().trim() || "Website visitor";
  const email = formData.get("email")?.toString().trim() || "Not provided";
  const topic = formData.get("company")?.toString().trim() || "General inquiry";
  const message = formData.get("message")?.toString().trim() || "";

  let subject = "CaribAI inquiry";
  let body = `Name: ${name}\nEmail: ${email}\n`;

  if (type === "early-access") {
    subject = "CaribAI early access request";
    body += "\nPlease add me to the CaribAI early access list.\n";
  } else if (type === "storefront-access") {
    subject = "CaribAI storefront early access request";
    body += "\nPlease add me to the CaribAI storefront early access list.\n";
  } else {
    body += `Topic: ${topic}\n\nMessage:\n${message || "No additional message provided."}\n`;
  }

  return `mailto:${activeInbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-demo-form]");
  if (!form) {
    return;
  }

  event.preventDefault();

  const note = form.querySelector("[data-form-note]");
  const nameField = form.querySelector('[name="name"]');
  const emailField = form.querySelector('[name="email"]');

  if (nameField && !nameField.value.trim()) {
    if (note) {
      note.textContent = "Please add your name before continuing.";
    }
    nameField.focus();
    return;
  }

  if (emailField && !emailField.value.trim()) {
    if (note) {
      note.textContent = "Please add your email before continuing.";
    }
    emailField.focus();
    return;
  }

  if (emailField && !emailField.checkValidity()) {
    if (note) {
      note.textContent = "Use a valid email address before continuing.";
    }
    emailField.focus();
    return;
  }

  window.location.href = buildMailtoLink(form);

  if (note) {
    note.textContent =
      form.getAttribute("data-success-message") ||
      "Your email app should open with a ready-to-send message for CaribAI.";
  }

  form.reset();
});

initSiteNav();
initSiteSettings();
