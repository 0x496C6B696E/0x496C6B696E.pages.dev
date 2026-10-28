/**
 * The boot log, shared by the HTML boot screen and the canvas-painted boot on the 3D monitor,
 * so both run the same lines on the same clock. Every number is read from the real data files.
 */
import { destinations, site } from "@/config/site";
import { projects } from "@/data/projects";
import { toolchain } from "@/data/stack";
import { capabilities } from "@/data/skills";
import { github, languageShares } from "@/data/github";
import { formatDate } from "@/lib/format";

export const BOOT_STEP_MS = 230;
export const BOOT_HOLD_MS = 500;

export function bootLines(): string[] {
  const pieces = toolchain.reduce((n, g) => n + g.items.length, 0);
  const snapshot = formatDate(github.fetchedAt);
  const tongues = languageShares(50).length;
  return [
    `starting ${site.system.toLowerCase()} v${site.version}`,
    `memory check: ${tongues} languages`,
    `mounting projects/: ${projects.length} repositories`,
    `loading skills.json: ${capabilities.length} capabilities`,
    `loading stack.yaml: ${pieces} entries`,
    snapshot ? `reading github.log: snapshot ${snapshot}` : "reading github.log: empty",
    `mounting ~: ${destinations.length} files`,
    "network: mail.eml, 2 routes",
    "ready. welcome back.",
  ];
}

/** How long the whole boot takes, in milliseconds. */
export function bootDuration(lines = bootLines().length): number {
  return (lines - 1) * BOOT_STEP_MS + BOOT_HOLD_MS;
}
