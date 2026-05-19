const BLOG_DATA_PATH = "content/blog/posts.json";

const escapeHTML = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const safeUrl = (value, fallback = "") => {
  const candidate = String(value ?? "").trim();
  if (!candidate) return fallback;

  if (
    candidate.startsWith("/") ||
    candidate.startsWith("./") ||
    candidate.startsWith("../") ||
    candidate.startsWith("#") ||
    /^(https?:|mailto:|tel:)/i.test(candidate) ||
    /^[a-z0-9][a-z0-9/_\-.]*$/i.test(candidate)
  ) {
    return candidate;
  }

  return fallback;
};

const normalizeWorkflowStatus = (value) => {
  const status = String(value || "").toLowerCase();
  return status === "draft" || status === "ready" || status === "live" ? status : "live";
};

const renderMarkdownSafely = (markdown) => {
  const safeSource = escapeHTML(markdown || "");
  const sanitizeRenderedHTML = (html) => {
    const template = document.createElement("template");
    template.innerHTML = html;

    template.content
      .querySelectorAll("script, style, iframe, object, embed, form, input, button, textarea, select")
      .forEach((node) => node.remove());

    template.content.querySelectorAll("*").forEach((node) => {
      Array.from(node.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value;

        if (name.startsWith("on")) {
          node.removeAttribute(attribute.name);
          return;
        }

        if (name === "href" || name === "src") {
          const nextValue = safeUrl(value, "");
          if (nextValue) {
            node.setAttribute(attribute.name, nextValue);
          } else {
            node.removeAttribute(attribute.name);
          }
        }
      });
    });

    return template.innerHTML;
  };

  if (!window.marked) {
    return sanitizeRenderedHTML(safeSource.replace(/\n/g, "<br />"));
  }

  return sanitizeRenderedHTML(
    window.marked.parse(safeSource, {
      mangle: false,
      headerIds: false,
    })
  );
};

const enhanceBlogRevealMotion = () => {
  const targets = Array.from(document.querySelectorAll(".panel, .blog-card, .post-shell"));

  if (!targets.length) {
    return;
  }

  targets.forEach((node, index) => {
    node.classList.add("reveal");
    node.style.setProperty("--reveal-delay", `${Math.min(index * 50, 300)}ms`);
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

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const estimateReadingTime = (text) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
};

const getPosts = async () => {
  const response = await fetch(BLOG_DATA_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load blog content.");
  }

  const payload = await response.json();
  const posts = Array.isArray(payload.posts) ? payload.posts : [];

  return posts
    .filter((post) => post && post.title && post.slug && normalizeWorkflowStatus(post.workflowStatus) === "live")
    .sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0));
};

const renderBlogList = (posts) => {
  const grid = document.querySelector("[data-blog-list]");
  const emptyState = document.querySelector("[data-blog-empty]");

  if (!grid) {
    return;
  }

  if (!posts.length) {
    if (emptyState) {
      emptyState.hidden = false;
    }
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  grid.innerHTML = posts
    .map((post) => {
      const readingTime = estimateReadingTime(post.body || "");
      return `
        <article class="blog-card ${post.featured ? "featured-post" : ""}">
          ${post.coverImage ? `<img class="blog-media" src="${safeUrl(post.coverImage)}" alt="${escapeHTML(post.title)} cover image" />` : ""}
          <span class="pill ${post.featured ? "" : "muted"}">${escapeHTML(post.category || "CaribAI Notes")}</span>
          <h2>${escapeHTML(post.title)}</h2>
          <p>${escapeHTML(post.excerpt || "")}</p>
          <div class="post-meta compact">
            <span>${escapeHTML(formatDate(post.publishDate))}</span>
            <span>${readingTime} min read</span>
          </div>
          <a class="text-link" href="blog-post.html?slug=${encodeURIComponent(post.slug)}">Read article</a>
        </article>
      `;
    })
    .join("");
};

const renderBlogPost = (posts) => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const shell = document.querySelector("[data-post-shell]");
  const emptyState = document.querySelector("[data-post-empty]");

  if (!shell) {
    return;
  }

  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    if (emptyState) {
      emptyState.hidden = false;
    }
    shell.hidden = true;
    return;
  }

  document.title = `${post.title} | CaribAI`;
  const description = post.excerpt || "Read the latest CaribAI article.";

  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", description);
  document
    .querySelector('meta[property="og:title"]')
    ?.setAttribute("content", `${post.title} | CaribAI`);
  document
    .querySelector('meta[property="og:description"]')
    ?.setAttribute("content", description);
  document
    .querySelector('meta[name="twitter:title"]')
    ?.setAttribute("content", `${post.title} | CaribAI`);
  document
    .querySelector('meta[name="twitter:description"]')
    ?.setAttribute("content", description);

  shell.querySelector("[data-post-category]").textContent = post.category || "CaribAI Notes";
  shell.querySelector("[data-post-title]").textContent = post.title;
  shell.querySelector("[data-post-date]").textContent = formatDate(post.publishDate);
  shell.querySelector("[data-post-reading-time]").textContent = `${estimateReadingTime(post.body || "")} min read`;
  shell.querySelector("[data-post-excerpt]").textContent = post.excerpt || "";
  shell.classList.add("post-shell-premium");

  const contentNode = shell.querySelector("[data-post-content]");
  const content = post.body || "";
  const existingMedia = shell.querySelector(".post-hero-media");
  if (existingMedia) {
    existingMedia.remove();
  }

  if (post.coverVideo) {
    const video = document.createElement("video");
    video.className = "post-hero-media";
    video.src = safeUrl(post.coverVideo);
    video.controls = true;
    video.playsInline = true;
    shell.querySelector("[data-post-excerpt]").after(video);
  } else if (post.coverImage) {
    const image = document.createElement("img");
    image.className = "post-hero-media";
    image.src = safeUrl(post.coverImage);
    image.alt = `${post.title} cover image`;
    shell.querySelector("[data-post-excerpt]").after(image);
  }

  contentNode.innerHTML = renderMarkdownSafely(content);

  shell.hidden = false;
  if (emptyState) {
    emptyState.hidden = true;
  }

  enhanceBlogRevealMotion();
};

const initBlog = async () => {
  try {
    const posts = await getPosts();
    renderBlogList(posts);
    renderBlogPost(posts);
  } catch (error) {
    const emptyState = document.querySelector("[data-blog-empty]");
    const postEmptyState = document.querySelector("[data-post-empty]");

    if (emptyState) {
      emptyState.hidden = false;
      emptyState.textContent = "Blog content is not available yet. Please try again after deployment.";
    }

    if (postEmptyState) {
      postEmptyState.hidden = false;
    }

    console.error(error);
  }

  enhanceBlogRevealMotion();
};

initBlog();
