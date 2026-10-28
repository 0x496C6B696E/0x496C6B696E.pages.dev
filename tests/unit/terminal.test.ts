import { describe, expect, it } from "vitest";
import { runCommand } from "@/lib/terminal";
import { kindlingLines } from "@/components/hub/KindlingSequence";
import { quests } from "@/data/projects";
import { destinations } from "@/config/site";

const ctx = { pathname: "/", mode: "explorer" as const };

describe("terminal", () => {
  it("lists help and destinations", () => {
    expect(runCommand("help", ctx).lines.length).toBeGreaterThan(5);
    expect(runCommand("ls", ctx).lines).toHaveLength(destinations.length);
  });
  it("warps by slug, label or title word", () => {
    expect(runCommand("warp projects", ctx).navigate).toBe("/projects");
    expect(runCommand("warp Tech Stack", ctx).navigate).toBe("/stack");
    expect(runCommand("warp armament", ctx).navigate).toBe("/stack");
    expect(runCommand("warp nowhere", ctx).navigate).toBeUndefined();
    expect(runCommand("warp", ctx).navigate).toBe("/");
  });
  it("opens quests by number, slug prefix or title word", () => {
    expect(runCommand("open 4", ctx).navigate).toBe(`/projects/${quests[3].slug}`);
    expect(runCommand("open createos", ctx).navigate).toBe("/projects/CreateOS");
    expect(runCommand("open gatewarden", ctx).navigate).toBe("/projects/portscanner");
    expect(runCommand("open 99", ctx).navigate).toBeUndefined();
  });
  it("switches modes only to known values", () => {
    expect(runCommand("mode immersive", ctx).mode).toBe("immersive");
    expect(runCommand("mode loud", ctx).mode).toBeUndefined();
    expect(runCommand("mode", ctx).lines[0]).toContain("explorer");
  });
  it("handles clear, empty and unknown input", () => {
    expect(runCommand("clear", ctx).clear).toBe(true);
    expect(runCommand("   ", ctx).lines).toEqual([]);
    expect(runCommand("frobnicate", ctx).lines[0]).toMatch(/unknown command/);
  });
});

describe("kindling sequence", () => {
  it("reports real counts from the data files", () => {
    const lines = kindlingLines();
    expect(lines.some((l) => l.includes(`${quests.length} records`))).toBe(true);
    expect(lines.some((l) => l.includes(`${destinations.length}`))).toBe(true);
    expect(lines.at(-1)).toMatch(/fire lit/);
  });
});
