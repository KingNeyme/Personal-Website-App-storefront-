const base = "https://caribailabs.vercel.app";

const routes = [
  "",
  "/about.html",
  "/projects.html",
  "/storefront.html",
  "/journey.html",
  "/tech-stack.html",
  "/certifications.html",
  "/contact.html",
  "/blog.html"
];

export default function sitemap() {
  const now = new Date();
  return routes.map((route) => ({
    url: `${base}${route || "/"}`,
    lastModified: now
  }));
}
