import { expect, test } from "@playwright/test";
import { immersiveVisitor } from "./helpers";

test.describe("immersive mode", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "WebGL is exercised in Chromium only");

  test("mounts the WebGL room and keeps it behind a window", async ({ page, isMobile }) => {
    await immersiveVisitor(page);
    await page.goto("/");
    await expect(page.locator("[data-backdrop]")).toHaveAttribute("data-backdrop", "3d");
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator("[data-scene]")).toHaveAttribute("data-scene", "ready", { timeout: 15_000 });
    await page.waitForTimeout(2500); // let the camera settle for the QA screenshot
    await page.screenshot({ path: `qa/screenshots/desktop-immersive-${isMobile ? "pixel7" : "1280x720"}.jpg`, type: "jpeg", quality: 82 });
    await page.getByRole("navigation", { name: "Destinations" }).getByRole("link", { name: /^projects/i }).click();
    await expect(page).toHaveURL(/\/projects$/);
    // the canvas survives navigation (persistent layout) and the window is readable over it
    await expect(page.locator("canvas")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Projects");
    await page.waitForTimeout(800);
    await page.screenshot({ path: `qa/screenshots/projects-immersive-${isMobile ? "pixel7" : "1280x720"}.jpg`, type: "jpeg", quality: 82 });
  });

  test("the lock screen over the 3D room, then the boot log", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop framing check");
    await page.addInitScript(() => localStorage.setItem("workstation:mode", "immersive"));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("[data-scene]")).toHaveAttribute("data-scene", "ready", { timeout: 15_000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: "qa/screenshots/lock-immersive-1440x900.jpg", type: "jpeg", quality: 82 });
    await page.getByTestId("enter").click();
    // the boot log runs with real counts, then the desktop appears
    await expect(page.getByTestId("boot")).toBeVisible({ timeout: 3_000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "qa/screenshots/boot-1440x900.jpg", type: "jpeg", quality: 82 });
    await expect(page.getByRole("navigation", { name: "Destinations" })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "qa/screenshots/desktop-immersive-1440x900.jpg", type: "jpeg", quality: 82 });
    await page.getByRole("navigation", { name: "Destinations" }).getByRole("link", { name: /^telemetry/i }).hover();
    await page.waitForTimeout(400);
    await page.screenshot({ path: "qa/screenshots/desktop-immersive-hover-1440x900.jpg", type: "jpeg", quality: 82 });
  });

  test("the mode toggle switches to the CSS room and back", async ({ page }) => {
    await immersiveVisitor(page);
    await page.goto("/about");
    const toggle = page.getByRole("button", { name: /immersive mode/i });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(page.locator("[data-backdrop]")).toHaveAttribute("data-backdrop", "css");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(page.locator("[data-backdrop]")).toHaveAttribute("data-backdrop", "3d");
  });

  test("reduced motion skips the boot sequence", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByTestId("enter").click();
    await expect(page.getByRole("navigation", { name: "Destinations" })).toBeVisible({ timeout: 2_000 });
  });
});
