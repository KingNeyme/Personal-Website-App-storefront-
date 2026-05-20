import Link from "next/link";

import { assetPath, routeHref } from "../lib/routes";
import EmailCaptureForm from "./EmailCaptureForm";

function ButtonRow({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="button-row">
      {items.map((item) => (
        <Link
          key={`${item.href}-${item.label}`}
          className={`button ${item.variant === "primary" ? "button-primary" : "button-secondary"}`}
          href={routeHref(item.href)}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function MediaFrame({ src, alt, className = "" }) {
  if (!src) return null;
  return (
    <div className={`media-frame ${className}`.trim()}>
      <img src={assetPath(src)} alt={alt || ""} />
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="section-heading-shell">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        {title ? <h2>{title}</h2> : null}
      </div>
      <div className="section-heading-meta">
        {description ? <p>{description}</p> : null}
        {action ? (
          <Link className="text-link" href={routeHref(action.href)}>
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function ValueGrid({ items = [] }) {
  return (
    <div className="value-grid">
      {items.map((item) => (
        <article className="value-card" key={item.title}>
          {item.badge || item.label ? <span className="pill">{item.badge || item.label}</span> : null}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          {item.meta?.length ? (
            <div className="meta-row">
              {item.meta.map((entry) => (
                <span key={entry}>{entry}</span>
              ))}
            </div>
          ) : null}
          {item.image ? <MediaFrame src={item.image} alt={item.imageAlt} className="card-media" /> : null}
          {item.href ? (
            <Link className="text-link" href={routeHref(item.href)}>
              {item.linkLabel || "Open"}
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function StatementPanel({ eyebrow, title, description }) {
  return (
    <article className="statement-panel">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <h3>{title}</h3> : null}
      {description ? <p>{description}</p> : null}
    </article>
  );
}

export function HomePage({ data, posts }) {
  const featuredProduct = (data.storefront?.items || []).find((item) => item.featured) || data.storefront?.items?.[0];
  const supportingProducts = (data.storefront?.items || []).filter((item) => item !== featuredProduct).slice(0, 2);
  const featuredPost = posts.find((post) => post.featured) || posts[0];

  return (
    <>
      <section className="hero-surface">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{data.hero?.eyebrow}</p>
            <h1>{data.hero?.title}</h1>
            <p className="hero-text">{data.hero?.description}</p>
            <ButtonRow items={data.hero?.actions || []} />
            <div className="hero-proof">
              {(data.hero?.points || []).slice(0, 3).map((point) => (
                <div className="hero-proof-item" key={point}>
                  <span className="signal-dot" />
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-stage">
            {featuredProduct ? (
              <article className="hero-feature-card">
                <div className="hero-feature-copy">
                  <p className="overline">Featured direction</p>
                  <h2>{featuredProduct.title}</h2>
                  <p>{featuredProduct.description}</p>
                  <div className="meta-row">
                    {(featuredProduct.meta || []).map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
                <MediaFrame src={featuredProduct.image} alt={featuredProduct.imageAlt} className="hero-feature-media" />
              </article>
            ) : null}
            <div className="support-stack">
              {(data.hero?.metrics || []).slice(0, 3).map((item) => (
                <article className={`support-card${item.featured ? " support-card-featured" : ""}`} key={item.title}>
                  <span className="pill">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="narrative-band">
        <SectionHeading eyebrow={data.positioning?.eyebrow} title={data.positioning?.title} description={data.positioning?.description} />
        <div className="narrative-grid">
          <article className="narrative-card narrative-card-highlight">
            <p className="overline">Brand architecture</p>
            <h3>{data.structure?.title}</h3>
            <p>{data.structure?.description}</p>
          </article>
          <ValueGrid items={(data.structure?.items || []).slice(0, 3)} />
        </div>
      </section>

      <section className="showcase-shell">
        <SectionHeading eyebrow={data.storefront?.eyebrow} title={data.storefront?.title} description={data.storefront?.description} action={{ href: "storefront.html", label: "Open storefront" }} />
        <div className="showcase-grid">
          {featuredProduct ? (
            <article className="showcase-feature">
              <div>
                <span className="pill">{featuredProduct.badge}</span>
                <h3>{featuredProduct.title}</h3>
                <p>{featuredProduct.description}</p>
                <div className="meta-row">
                  {(featuredProduct.meta || []).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
              <MediaFrame src={featuredProduct.image} alt={featuredProduct.imageAlt} className="showcase-feature-media" />
            </article>
          ) : null}
          <div className="showcase-stack">
            {supportingProducts.map((item) => (
              <article className="showcase-compact" key={item.title}>
                <div>
                  <span className="pill pill-muted">{item.badge}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="timeline-shell">
        <SectionHeading eyebrow={data.execution?.eyebrow} title={data.execution?.title} description={data.businessModel?.title} action={data.execution?.link} />
        <div className="timeline-grid">
          <div className="timeline-track">
            {(data.execution?.items || []).map((item, index) => (
              <article className="timeline-step" key={item.title}>
                <span className="timeline-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <span className="pill pill-muted">{item.status}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="timeline-side">
            <article className="operating-card">
              <p className="overline">What CaribAI builds</p>
              <h3>{data.build?.title}</h3>
              <div className="copy-list">
                {(data.build?.items || []).map((item) => (
                  <div key={item.title}>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </article>
            <article className="operating-card operating-card-accent">
              <p className="overline">Operating model</p>
              <h3>{data.businessModel?.title}</h3>
              <div className="loop-list">
                {(data.businessModel?.items || []).map((item, index) => (
                  <div className="loop-step" key={item.title}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="ecosystem-shell">
        <SectionHeading eyebrow={data.growthHub?.eyebrow} title={data.growthHub?.title} description={data.growthHub?.description} />
        <div className="ecosystem-grid-alt">
          <ValueGrid items={data.growthHub?.items || []} />
          <article className="journal-preview">
            <p className="overline">Visible thinking</p>
            <h3>{data.lens?.title}</h3>
            <p>{data.lens?.eyebrow || "Why it compounds"}</p>
            {featuredPost ? (
              <div className="journal-snippet">
                <span className="pill pill-muted">{featuredPost.category}</span>
                <h4>{featuredPost.title}</h4>
                <p>{featuredPost.excerpt}</p>
                <Link className="text-link" href={`/blog-post.html?slug=${featuredPost.slug}`}>
                  Read the note
                </Link>
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <section className="focus-shell-alt">
        <SectionHeading eyebrow={data.focus?.eyebrow} title={data.focus?.title} action={{ href: "projects.html", label: "View all projects" }} />
        <div className="focus-grid-alt">
          {(data.focus?.items || []).map((item) => (
            <article className="focus-rail-card" key={item.title}>
              <span className="pill">{item.status}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lead-shell">
        <div className="lead-copy">
          <p className="eyebrow">{data.lead?.eyebrow}</p>
          <h2>{data.lead?.title}</h2>
          <p>{data.lead?.description}</p>
        </div>
        <EmailCaptureForm
          email="caribailabs@gmail.com"
          title={data.lead?.title}
          buttonLabel={data.lead?.buttonLabel || "Join Early Access"}
          note={data.lead?.note}
        />
      </section>
    </>
  );
}

export function StandardPage({ data, sections = [], ctaMode = "link" }) {
  const closingData = ctaMode === "lead" && data.lead ? data.lead : data.cta;

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-grid">
          <div className="page-hero-copy">
            <p className="eyebrow">{data.hero?.eyebrow}</p>
            <h1>{data.hero?.title}</h1>
            <p>{data.hero?.description}</p>
          </div>
          <MediaFrame src={data.hero?.image} alt={data.hero?.imageAlt} className="page-hero-media" />
        </div>
      </section>

      {sections.map((section) => (
        <section className={`content-section ${section.variant || ""}`} key={section.key}>
          <SectionHeading
            eyebrow={section.data?.eyebrow}
            title={section.data?.title}
            description={section.data?.description}
            action={section.action}
          />
          {section.type === "cards" ? <ValueGrid items={section.data?.items || []} /> : null}
          {section.type === "summary" ? <ValueGrid items={section.data?.items || []} /> : null}
          {section.type === "boxes" ? <ValueGrid items={section.data?.boxes || []} /> : null}
          {section.type === "statement" ? (
            <StatementPanel eyebrow={section.data?.eyebrow} title={section.data?.title} description={section.data?.description} />
          ) : null}
          {section.type === "contact-form" ? (
            <div className="lead-shell lead-shell-contact">
              <div className="lead-copy">
                <p>{section.data?.title}</p>
                <div className="copy-list">
                  {(section.data?.items || []).map((item) => (
                    <div className="bullet-row" key={item}>
                      <span className="signal-dot" />
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <EmailCaptureForm
                email="caribailabs@gmail.com"
                title={data.hero?.title}
                buttonLabel={data.form?.buttonLabel || "Send Inquiry"}
                note={data.form?.note}
                mode="contact"
              />
            </div>
          ) : null}
        </section>
      ))}

      {closingData ? (
        <section className="closing-cta">
          <div>
            <p className="eyebrow">{closingData.eyebrow}</p>
            <h2>{closingData.title}</h2>
            <p>{closingData.description}</p>
          </div>
          {ctaMode === "lead" ? (
            <EmailCaptureForm email="caribailabs@gmail.com" title={closingData.title} buttonLabel={data.lead?.buttonLabel || "Join Early Access"} note={data.lead?.note} />
          ) : (
            <Link className="button button-primary" href={routeHref(closingData.href)}>
              {closingData.label}
            </Link>
          )}
        </section>
      ) : null}
    </>
  );
}

export function BlogIndex({ posts }) {
  const [featured, ...rest] = posts;

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-grid">
          <div className="page-hero-copy">
            <p className="eyebrow">Journal</p>
            <h1>Ideas, launch notes, and product thinking behind CaribAI.</h1>
            <p>Use the journal to show how the ecosystem is being shaped, what is being learned, and why each product direction exists.</p>
          </div>
          <article className="journal-highlight">
            <p className="overline">Featured note</p>
            {featured ? (
              <>
                <span className="pill pill-muted">{featured.category}</span>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <Link className="button button-primary" href={`/blog-post.html?slug=${featured.slug}`}>
                  Read article
                </Link>
              </>
            ) : null}
          </article>
        </div>
      </section>
      <section className="content-section">
        <div className="blog-list">
          {posts.map((post) => (
            <article className="blog-card-premium" key={post.slug}>
              <span className="pill pill-muted">{post.category}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="blog-card-meta">
                <span>{post.publishDate}</span>
                <Link className="text-link" href={`/blog-post.html?slug=${post.slug}`}>
                  Read
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function renderMarkdown(body = "") {
  const lines = body.split("\n");
  const nodes = [];
  let listItems = [];

  function flushList() {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`list-${nodes.length}`} className="post-list">
        {listItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
    listItems = [];
  }

  lines.forEach((line, index) => {
    const value = line.trim();
    if (!value) {
      flushList();
      return;
    }

    if (value.startsWith("## ")) {
      flushList();
      nodes.push(
        <h2 key={`h2-${index}`} className="post-subhead">
          {value.replace(/^## /, "")}
        </h2>
      );
      return;
    }

    if (value.startsWith("- ")) {
      listItems.push(value.replace(/^- /, ""));
      return;
    }

    flushList();
    nodes.push(
      <p key={`p-${index}`} className="post-paragraph">
        {value}
      </p>
    );
  });

  flushList();
  return nodes;
}

export function BlogPost({ post }) {
  return (
    <section className="post-shell">
      <div className="post-head">
        <span className="pill pill-muted">{post.category}</span>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        <div className="blog-card-meta">
          <span>{post.publishDate}</span>
          <Link className="text-link" href="/blog.html">
            Back to journal
          </Link>
        </div>
      </div>
      <article className="post-body">{renderMarkdown(post.body)}</article>
    </section>
  );
}
