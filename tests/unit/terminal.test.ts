import { describe, expect, it } from "vitest";
import { runCommand, PROMPT } from "@/lib/terminal";
import { bootLines } from "@/components/hub/BootSequence";
import { quests } from "@/data/projects";
import { destinations } from "@/config/site";

const ctx = { pathname: "/", mode: "explorer" as const };

describe("terminal", () => {
  it("has a prompt built from the handle and the system name", () => {
    expect(PROMPT).toBe("0x496c6b696e@workstation:~$");
  });
  it("lists help and files", () => {
    expect(runCommand("help", ctx).lines.length).toBeGreaterThan(5);
    expect(runCommand("ls", ctx).lines).toHaveLength(destinations.length);
  });
  it("opens files by slug, file name, label or title", () => {
    expect(runCommand("cd projects", ctx).navigate).toBe("/projects");
    expect(runCommand("cd about.txt", ctx).navigate).toBe("/about");
    expect(runCommand("cd Tech Stack", ctx).navigate).toBe("/stack");
    expect(runCommand("cd toolchain", ctx).navigate).toBe("/stack");
    expect(runCommand("cd github.log", ctx).navigate).toBe("/stats");
    expect(runCommand("cd nowhere", ctx).navigate).toBeUndefined();
    expect(runCommand("cd", ctx).navigate).toBe("/");
    expect(runCommand("cd ..", ctx).navigate).toBe("/");
  });
  it("opens projects by number, name prefix or title word", () => {
    expect(runCommand("open 4", ctx).navigate).toBe(`/projects/${quests[3].slug}`);
    expect(runCommand("open createos", ctx).navigate).toBe("/projects/CreateOS");
    expect(runCommand("open scanner", ctx).navigate).toBe("/projects/portscanner");
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
    expect(runCommand("frobnicate", ctx).lines[0]).toMatch(/command not found/);
  });
});

describe("boot sequence", () => {
  it("reports real counts from the data files", () => {
    const lines = bootLines();
    expect(lines.some((l) => l.includes(`${quests.length} projects`))).toBe(true);
    expect(lines.some((l) => l.includes(`${destinations.length} files`))).toBe(true);
    expect(lines.at(-1)).toMatch(/boot complete/);
  });
});
