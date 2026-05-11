import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");

const workflowStates = new Set(["draft", "ready", "live"]);

const readJson = (relativePath) => {
  const absolutePath = path.join(repoRoot, relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
};

const errors = [];

const assert = (condition, message) => {
  if (!condition) {
    errors.push(message);
  }
};

const pageFiles = [
  "content/site/home.json",
  "content/site/about.json",
  "content/site/projects.json",
  "content/site/storefront.json",
  "content/site/journey.json",
  "content/site/tech-stack.json",
  "content/site/certifications.json",
  "content/site/contact.json",
];

for (const file of pageFiles) {
  const payload = readJson(file);
  assert(workflowStates.has(payload._workflowStatus), `${file}: invalid _workflowStatus`);
}

const settings = readJson("content/site/settings.json");
assert(Array.isArray(settings.navigation?.links), "content/site/settings.json: navigation.links must be an array");
assert(Array.isArray(settings.footer?.links), "content/site/settings.json: footer.links must be an array");
assert(typeof settings.contact?.email === "string", "content/site/settings.json: contact.email must be a string");

const media = readJson("content/site/media.json");
for (const [groupKey, group] of Object.entries(media)) {
  assert(typeof group.title === "string" && group.title.length > 0, `content/site/media.json: ${groupKey}.title is required`);
  assert(Array.isArray(group.items), `content/site/media.json: ${groupKey}.items must be an array`);
}

const postsPayload = readJson("content/blog/posts.json");
assert(Array.isArray(postsPayload.posts), "content/blog/posts.json: posts must be an array");
for (const [index, post] of postsPayload.posts.entries()) {
  assert(typeof post.title === "string" && post.title.length > 0, `content/blog/posts.json: posts[${index}].title is required`);
  assert(typeof post.slug === "string" && post.slug.length > 0, `content/blog/posts.json: posts[${index}].slug is required`);
  assert(workflowStates.has(post.workflowStatus), `content/blog/posts.json: posts[${index}].workflowStatus is invalid`);
}

const storefront = readJson("content/site/storefront.json");
assert(workflowStates.has(storefront._workflowStatus), "content/site/storefront.json: invalid _workflowStatus");
assert(Array.isArray(storefront.products?.items), "content/site/storefront.json: products.items must be an array");
for (const [index, item] of storefront.products.items.entries()) {
  assert(typeof item.title === "string" && item.title.length > 0, `content/site/storefront.json: products.items[${index}].title is required`);
  assert(workflowStates.has(item.workflowStatus), `content/site/storefront.json: products.items[${index}].workflowStatus is invalid`);
}

if (errors.length) {
  console.error("CaribAI content validation failed:");
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("CaribAI content validation passed.");
