/**
 * Static export verification. Runs as `postbuild`.
 * Fails the build if a route, SEO file or asset is missing, if placeholder text slipped
 * into the HTML, or if anything that looks like a secret is in the output.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../out/", import.meta.url));
const PROJECTS_TS = fileURLToPath(new URL("../src/data/projects.ts", import.meta.url));

const slugs = [...(await readFile(PROJECTS_TS, "utf8")).matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]);

const required = [
  "index.html",
  "404.html",
  "about.html",
  "skills.html",
  "projects.html",
  "stack.html",
  "files.html",
  "browser.html",
  "stats.html",
  "contact.html",
  ...slugs.map((s) => `projects/${s}.html`),
  "sitemap.xml",
  "robots.txt",
  "_headers",
  "og.png",
  "favicon.svg",
  "favicon.ico",
  "apple-touch-icon.png",
];

const problems = [];

for (const file of required) {
  try {
    await stat(join(OUT, file));
  } catch {
    problems.push(`missing: ${file}`);
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else files.push(p);
  }
  return files;
}

const PLACEHOLDER = /lorem ipsum|TODO:|FIXME|placeholder text|coming soon/i;
const SECRET = /\b(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-ant-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16})\b/;

for (const file of await walk(OUT)) {
  if (!/\.(html|js|css|json|txt|xml)$/.test(file)) continue;
  const text = await readFile(file, "utf8");
  const rel = relative(OUT, file);
  if (file.endsWith(".html") && PLACEHOLDER.test(text)) problems.push(`placeholder text in ${rel}`);
  if (SECRET.test(text)) problems.push(`possible secret in ${rel}`);
}

if (problems.length) {
  console.error("[verify-export] FAILED");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log(`[verify-export] ok: ${required.length} required files present, no placeholders, no secrets`);
