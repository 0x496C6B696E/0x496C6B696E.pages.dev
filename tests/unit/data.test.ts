import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { destinationFor, destinations } from "@/config/site";
import { projects, projectRepoUrl } from "@/data/projects";
import { toolchain } from "@/data/stack";
import { capabilities } from "@/data/skills";
import { github, languageShares, recentRepos } from "@/data/github";
import { TECH_ICONS, monogram } from "@/components/ui/TechIcon";

const PUBLIC = join(process.cwd(), "public");
const GH = /^https:\/\/github\.com\/0x496C6B696E(\/[\w.-]+)*$/;

describe("destinations", () => {
  it("has six unique destinations with matching paths", () => {
    expect(destinations).toHaveLength(6);
    expect(new Set(destinations.map((d) => d.path)).size).toBe(6);
    for (const d of destinations) expect(d.path).toBe(`/${d.slug}`);
  });
  it("resolves nested paths to their destination", () => {
    expect(destinationFor("/projects/CreateOS")?.slug).toBe("projects");
    expect(destinationFor("/")).toBeUndefined();
  });
});

describe("projects", () => {
  it("have unique slugs that equal their repository names", () => {
    expect(new Set(projects.map((q) => q.slug)).size).toBe(projects.length);
    for (const q of projects) expect(q.slug).toBe(q.repo);
  });
  it("link to the developer's own GitHub", () => {
    for (const q of projects) expect(projectRepoUrl(q)).toMatch(GH);
  });
  it("ship every referenced image with dimensions", () => {
    for (const q of projects)
      for (const img of q.images ?? []) {
        expect(existsSync(join(PUBLIC, img.src))).toBe(true);
        expect(img.width).toBeGreaterThan(0);
        expect(img.height).toBeGreaterThan(0);
        expect(img.alt.length).toBeGreaterThan(10);
      }
  });
  it("contain no placeholder copy", () => {
    const text = JSON.stringify(projects).toLowerCase();
    expect(text).not.toMatch(/lorem|todo|tbd|coming soon/);
  });
});

describe("toolchain", () => {
  it("only references icons that are bundled", () => {
    for (const group of toolchain) for (const item of group.items) if (item.icon) expect(TECH_ICONS[item.icon], `${item.name} -> ${item.icon}`).toBeDefined();
  });
  it("names every source", () => {
    for (const group of toolchain) for (const item of group.items) expect(item.source.length).toBeGreaterThan(0);
  });
  it("builds readable monograms", () => {
    expect(monogram("Django REST Framework")).toBe("DR");
    expect(monogram("AWS")).toBe("AW");
    expect(monogram("Make")).toBe("MA");
  });
});

describe("capabilities", () => {
  it("keep levels inside 0..100 and evidence on GitHub", () => {
    for (const a of capabilities) {
      expect(a.level).toBeGreaterThanOrEqual(0);
      expect(a.level).toBeLessThanOrEqual(100);
      for (const e of a.evidence) expect(e.href).toMatch(GH);
    }
  });
});

describe("github snapshot", () => {
  it("has the expected shape", () => {
    expect(Array.isArray(github.repos)).toBe(true);
    expect(github.fetchedAt === null || typeof github.fetchedAt === "string").toBe(true);
  });
  it("derives language shares that sum to about 100", () => {
    const shares = languageShares(50);
    if (shares.length === 0) return;
    const sum = shares.reduce((s, l) => s + l.percent, 0);
    expect(sum).toBeGreaterThan(99);
    expect(sum).toBeLessThan(101);
  });
  it("orders recent repositories newest first", () => {
    const recent = recentRepos(10);
    for (let i = 1; i < recent.length; i++) expect(+new Date(recent[i - 1].pushedAt)).toBeGreaterThanOrEqual(+new Date(recent[i].pushedAt));
  });
});
