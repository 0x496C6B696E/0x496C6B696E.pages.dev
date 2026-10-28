import { expect, test, type Page } from "@playwright/test";
import { ROUTES, explorerVisitor } from "./helpers";

/** Console errors, page errors and failed requests across every exported route. */
test.describe("console and network hygiene", () => {
  for (const route of ROUTES) {
    test(`clean console on ${route}`, async ({ page }) => {
      const problems: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") problems.push(`console: ${msg.text()}`);
      });
      page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
      page.on("response", (res) => {
        if (res.status() >= 400) problems.push(`${res.status()} ${res.url()}`);
      });
      await explorerVisitor(page);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(problems).toEqual([]);
    });
  }
});

async function collectLinks(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).map((a) => ({
      href: a.getAttribute("href") ?? "",
      target: a.getAttribute("target"),
      rel: a.getAttribute("rel"),
      // accessible name: aria-label or text content (icon-only links carry an aria-label)
      text: (a.getAttribute("aria-label") ?? a.textContent ?? "").trim(),
    })),
  );
}

test("every internal link resolves and every external link is hardened", async ({ page, request }) => {
  await explorerVisitor(page);
  const internal = new Set<string>();
  for (const route of ROUTES) {
    await page.goto(route);
    for (const link of await collectLinks(page)) {
      if (link.href.startsWith("http")) {
        expect(link.target, `${link.href} should open in a new tab`).toBe("_blank");
        expect(link.rel, `${link.href} needs rel=noopener`).toMatch(/noopener/);
      } else if (link.href.startsWith("/")) {
        internal.add(link.href.split("#")[0]);
      } else {
        expect(link.href.startsWith("#") || link.href.startsWith("mailto:"), `unexpected href ${link.href}`).toBe(true);
      }
      expect(link.text.length > 0 || link.href.startsWith("mailto:"), `link without text: ${link.href}`).toBe(true);
    }
  }
  for (const href of internal) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
  }
  expect(internal.size).toBeGreaterThan(8);
});

test.describe("accessibility basics", () => {
  for (const route of ROUTES) {
    test(`landmarks, headings and names on ${route}`, async ({ page }) => {
      await explorerVisitor(page);
      await page.goto(route);
      await expect(page.locator("main#main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
      const unnamed = await page.evaluate(() => {
        const controls = Array.from(document.querySelectorAll<HTMLElement>("a, button"));
        return controls
          .filter((el) => {
            const label = el.getAttribute("aria-label") || el.getAttribute("title") || (el.textContent ?? "").trim();
            return !label;
          })
          .map((el) => el.outerHTML.slice(0, 120));
      });
      expect(unnamed).toEqual([]);
      const missingAlt = await page.evaluate(() => Array.from(document.querySelectorAll("img")).filter((img) => !img.hasAttribute("alt")).length);
      expect(missingAlt).toBe(0);
    });
  }

  test("the skip link moves focus to the main content", async ({ page, browserName }) => {
    await explorerVisitor(page);
    await page.goto("/about");
    const skip = page.getByRole("link", { name: "Skip to content" });
    // Safari/WebKit does not move keyboard focus onto links by default (a browser setting),
    // so there the link is focused directly and only its behaviour is asserted.
    if (browserName === "webkit") await skip.focus();
    else await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});

test("sitemap, robots and security headers are in place", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const route of ROUTES) expect(xml).toContain(route === "/" ? "<loc>http" : route);
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("sitemap.xml");
  if (process.env.BASE_URL) {
    // Against a deployment, Cloudflare consumes _headers and applies it as real response headers.
    const home = await request.get("/");
    expect(home.headers()["content-security-policy"]).toContain("default-src 'self'");
    expect(home.headers()["x-frame-options"]).toBe("DENY");
  } else {
    const headers = await request.get("/_headers");
    expect(await headers.text()).toContain("Content-Security-Policy");
  }
});
