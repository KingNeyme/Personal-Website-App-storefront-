import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(currentFile), "..");

function filePath(...segments) {
  return path.join(root, ...segments);
}

async function readJson(...segments) {
  const raw = await fs.readFile(filePath(...segments), "utf8");
  return JSON.parse(raw);
}

export async function getSettings() {
  return readJson("content", "site", "settings.json");
}

export async function getHome() {
  return readJson("content", "site", "home.json");
}

export async function getPageContent(name) {
  return readJson("content", "site", `${name}.json`);
}

export async function getPosts() {
  const data = await readJson("content", "blog", "posts.json");
  return (data.posts || []).filter((post) => (post.workflowStatus || "draft").toLowerCase() === "live");
}

export async function getPostBySlug(slug) {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) || null;
}
