/**
 * Windows-only export fix. Runs as the first `postbuild` step.
 *
 * Next.js 16.4 writes segment-prefetch payloads for static export by turning the segment
 * path into a file name (`/skills/__PAGE__` -> `__next.skills.__PAGE__.txt`). On Windows the
 * collected segment paths contain backslashes, so only the leading slash is replaced and the
 * file lands in a nested directory (`__next.skills/__PAGE__.txt`). The client then 404s on
 * prefetch. Linux builds (Cloudflare Pages) are unaffected; this makes local builds match.
 *
 * ponytail: delete this file once Next's exporter normalises separators on Windows.
 */
import { readdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../out/", import.meta.url));

async function collect(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(path)));
    else files.push(path);
  }
  return files;
}

async function flatten(dir) {
  let moved = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      for (const file of await collect(path)) {
        const rel = file.slice(dir.length + 1).split(/[\\/]/).join(".");
        await rename(file, join(dir, rel));
        moved++;
      }
      await rm(path, { recursive: true, force: true });
    } else if (entry.name !== "_next") {
      moved += await flatten(path);
    }
  }
  return moved;
}

const moved = await flatten(OUT);
if (moved) console.log(`[normalize-export] flattened ${moved} segment prefetch file(s) for Windows`);
