import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");

const syncTargets = [
  ["assets", "assets"],
  ["content", "content"],
  ["cms", "cms"]
];

mkdirSync(publicDir, { recursive: true });

for (const [sourceName, destName] of syncTargets) {
  const source = path.join(root, sourceName);
  const destination = path.join(publicDir, destName);

  if (!existsSync(source)) continue;
  rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
}

console.log("Synced assets, content, and cms into public/");
