/**
 * Build-time GitHub snapshot.
 *
 * Fetches public profile, repositories and per-repo language bytes for the configured
 * user and writes src/data/github.snapshot.json. Runs as `prebuild`.
 *
 * - Unauthenticated by default (about 8 requests per build, well under the 60/hour limit).
 * - If GITHUB_TOKEN is set in the build environment it is sent as a bearer token. It is
 *   only ever read here, in Node, and never reaches the browser bundle.
 * - Any failure keeps the committed snapshot so a build never breaks on API trouble.
 * - Set BONFIREOS_SKIP_GITHUB=1 to skip the network entirely (tests, offline builds).
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const USER = "0x496C6B696E";
const OUT = fileURLToPath(new URL("../src/data/github.snapshot.json", import.meta.url));
const API = "https://api.github.com";

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "bonfireos-build",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function get(url) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function hasSnapshot() {
  try {
    await readFile(OUT);
    return true;
  } catch {
    return false;
  }
}

async function writeEmpty(reason) {
  const empty = { fetchedAt: null, user: null, repos: [], languages: {} };
  await writeFile(OUT, JSON.stringify(empty, null, 2) + "\n");
  console.warn(`[github] ${reason}; wrote an empty snapshot so the build can continue`);
}

if (process.env.BONFIREOS_SKIP_GITHUB === "1") {
  if (await hasSnapshot()) console.log("[github] skipped (BONFIREOS_SKIP_GITHUB=1); using committed snapshot");
  else await writeEmpty("skipped and no snapshot existed");
  process.exit(0);
}

try {
  const [user, repos] = await Promise.all([
    get(`${API}/users/${USER}`),
    get(`${API}/users/${USER}/repos?per_page=100&sort=pushed`),
  ]);

  const own = repos.filter((r) => !r.fork);
  const languages = {};
  for (const repo of own) {
    const langs = await get(repo.languages_url);
    for (const [name, bytes] of Object.entries(langs)) languages[name] = (languages[name] ?? 0) + bytes;
  }

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    user: {
      login: user.login,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      htmlUrl: user.html_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      createdAt: user.created_at,
    },
    repos: repos.map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      fork: r.fork,
      archived: r.archived,
      pushedAt: r.pushed_at,
      createdAt: r.created_at,
      htmlUrl: r.html_url,
      homepage: r.homepage || null,
      topics: r.topics ?? [],
      license: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null,
    })),
    languages,
  };

  await writeFile(OUT, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`[github] snapshot updated: ${own.length} own repositories, ${Object.keys(languages).length} languages`);
} catch (err) {
  const reason = err instanceof Error ? err.message : String(err);
  if (await hasSnapshot()) console.warn(`[github] fetch failed (${reason}); using committed snapshot`);
  else await writeEmpty(`fetch failed (${reason}) and no snapshot existed`);
}
