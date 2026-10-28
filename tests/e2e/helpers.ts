import type { Page } from "@playwright/test";
import { destinations } from "../../src/config/site";
import { projects } from "../../src/data/projects";

/** Every static route the site exports. */
export const ROUTES = ["/", ...destinations.map((d) => d.path), ...projects.map((q) => `/projects/${q.slug}`)];

/** Pretend the visitor already entered the camp and prefers the CSS scene (deterministic, no WebGL). */
export async function explorerVisitor(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("workstation:entered", "1");
    localStorage.setItem("workstation:mode", "explorer");
  });
}

export async function immersiveVisitor(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("workstation:entered", "1");
    localStorage.setItem("workstation:mode", "immersive");
  });
}

export async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}
