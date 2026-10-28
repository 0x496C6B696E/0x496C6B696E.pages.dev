import { expect, test } from "@playwright/test";
import { ROUTES, explorerVisitor, horizontalOverflow } from "./helpers";

/**
 * Responsive layout checks at the widths the spec calls out plus landscape and tall viewports.
 * Screenshots (tag @shots) land in qa/screenshots for the visual QA loop.
 */
const VIEWPORTS = [
  { w: 320, h: 568 },
  { w: 375, h: 667 },
  { w: 390, h: 844 },
  { w: 768, h: 1024 },
  { w: 1024, h: 768 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 },
  { w: 844, h: 390 }, // phone landscape
  { w: 390, h: 1400 }, // unusually tall
];

const SHOT_VIEWPORTS = new Set(["390x844", "768x1024", "1440x900"]);
const SHOT_ROUTES = new Set(["/", "/about", "/skills", "/projects", "/projects/AI-Driven-Crawling-Ingestion", "/stack", "/stats", "/contact"]);

test.describe("no horizontal overflow at any viewport", () => {
  // The sweep sets its own viewports, so it runs once: desktop Chromium at device scale 1
  // (mobile emulation would only re-run it at a 2.6x scale and bloat the screenshots).
  test.skip(({ browserName, isMobile }) => browserName !== "chromium" || isMobile, "viewport sweep runs once, in desktop Chromium");

  for (const vp of VIEWPORTS) {
    const size = `${vp.w}x${vp.h}`;
    test(`${size} @shots`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await explorerVisitor(page);
      for (const route of ROUTES) {
        await page.goto(route);
        await page.waitForLoadState("networkidle");
        expect(await horizontalOverflow(page), `${route} overflows at ${size}`).toBeLessThanOrEqual(0);
        if (SHOT_VIEWPORTS.has(size) && SHOT_ROUTES.has(route)) {
          const name = route === "/" ? "desktop" : route.slice(1).replace(/\//g, "-");
          await page.screenshot({ path: `qa/screenshots/${name}-${size}.jpg`, type: "jpeg", quality: 82, fullPage: route !== "/" });
        }
      }
    });
  }

  test("standby screen @shots", async ({ page }) => {
    for (const vp of [
      { w: 390, h: 844 },
      { w: 1440, h: 900 },
    ]) {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto("/");
      await expect(page.getByTestId("enter")).toBeVisible();
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
      await page.screenshot({ path: `qa/screenshots/standby-${vp.w}x${vp.h}.jpg`, type: "jpeg", quality: 82 });
    }
  });
});

test("touch targets on the desktop are at least 44px tall on mobile", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "layout check, one engine is enough");
  await page.setViewportSize({ width: 375, height: 667 });
  await explorerVisitor(page);
  await page.goto("/");
  const boxes = await page.getByRole("navigation", { name: "Destinations" }).getByRole("link").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
  for (const h of boxes) expect(h).toBeGreaterThanOrEqual(44);
});
