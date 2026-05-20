export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about.html", "/projects.html", "/storefront.html", "/journey.html", "/tech-stack.html", "/certifications.html", "/contact.html", "/blog.html", "/blog-post.html"],
        disallow: ["/cms/", "/cms/app/"]
      }
    ],
    sitemap: "https://caribailabs.vercel.app/sitemap.xml"
  };
}
