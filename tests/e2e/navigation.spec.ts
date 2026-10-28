import { expect, test } from "@playwright/test";
import { destinations, site } from "../../src/config/site";
import { explorerVisitor } from "./helpers";

test("the lock screen powers on into the desktop", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: site.name })).toBeVisible();
  const enter = page.getByTestId("enter");
  await expect(enter).toBeEnabled();
  await enter.click();
  await expect(page.getByRole("navigation", { name: "Destinations" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("navigation", { name: "Destinations" }).getByRole("link", { name: /^projects/i })).toBeVisible();
});

test("skipping the boot lands in explorer mode immediately", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /skip boot/i }).click();
  await expect(page.getByRole("navigation", { name: "Destinations" })).toBeVisible({ timeout: 3_000 });
  await expect(page.locator("[data-backdrop]")).toHaveAttribute("data-backdrop", "css");
  // the choice is remembered
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Destinations" })).toBeVisible();
});

test("every file opens from the desktop and Escape closes it", async ({ page }) => {
  await explorerVisitor(page);
  for (const d of destinations) {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Destinations" }).getByRole("link", { name: new RegExp(`^${d.title}\\b`, "i") }).click();
    await expect(page).toHaveURL(new RegExp(`${d.path}$`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(d.title);
    await expect(page.getByRole("link", { name: /home: back to the desktop/i })).toBeVisible();
    // the mode toggle only renders after hydration, so the Escape listener is attached by now
    await expect(page.getByRole("button", { name: "Immersive mode" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("navigation", { name: "Destinations" })).toBeVisible();
  }
});

test("the desktop is fully keyboard navigable", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Destinations" });
  await expect(nav).toBeVisible();
  const first = nav.getByRole("link").first();
  await first.focus();
  await expect(first).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(nav.getByRole("link").nth(1)).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(first).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Profile");
});

test("the window status line walks to the neighbouring file", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/about");
  await page.getByRole("link", { name: /next destination/i }).click();
  await expect(page).toHaveURL(/\/skills$/);
  await page.getByRole("link", { name: /previous destination/i }).click();
  await expect(page).toHaveURL(/\/about$/);
});

test("a project deep link renders real repository data", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/projects/CreateOS");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("CreateOS");
  const repoLink = page.getByRole("link", { name: /view on github/i });
  await expect(repoLink).toHaveAttribute("href", "https://github.com/0x496C6B696E/CreateOS");
  await expect(repoLink).toHaveAttribute("rel", /noopener/);
  const width = page.viewportSize()?.width ?? 1280;
  if (width >= 768) await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("projects");
  else await expect(page.getByRole("link", { name: /back to projects/i })).toBeVisible();
});

test("the toolchain inspects a selected entry", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/stack");
  await page.getByRole("tab", { name: "Frameworks" }).click();
  await page.getByRole("button", { name: "Django", exact: true }).click();
  const inspect = page.locator("#armory-inspect");
  await expect(inspect).toContainText("Django");
  await expect(inspect).toContainText("Restaurant-Management-System");
});

test("the capability sheet switches tabs with the keyboard", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/skills");
  await page.getByRole("tab", { name: "Capabilities" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Creed" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Small diffs", { exact: true })).toBeVisible();
});

test("the mail page only offers real, verified channels", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: /open profile/i })).toHaveAttribute("href", "https://github.com/0x496C6B696E");
  await expect(page.getByRole("link", { name: /write/i })).toHaveAttribute("href", /^mailto:0x496c6b696e@proton\.me/);
  await expect(page.locator("form")).toHaveCount(0);
});

test("the terminal opens with the backtick key and can navigate", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/");
  // taskbar buttons only render after hydration, so the global key listener exists by now
  await expect(page.getByRole("button", { name: "Terminal" })).toBeVisible();
  await page.keyboard.press("`");
  const terminal = page.getByRole("region", { name: "Terminal" });
  await expect(terminal).toBeVisible();
  const input = page.getByLabel("0x496c6b696e@workstation:~$");
  await expect(input).toBeFocused();
  await input.fill("ls");
  await input.press("Enter");
  await expect(terminal.getByRole("log")).toContainText("projects/");
  await input.fill("cd toolchain");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/stack$/, { timeout: 10_000 });
  await input.fill("open scanner");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/projects\/portscanner$/, { timeout: 10_000 });
  // Escape inside the terminal closes it without leaving the page
  await input.press("Escape");
  await expect(terminal).toHaveCount(0);
  await expect(page).toHaveURL(/\/projects\/portscanner$/);
});

test("the taskbar exposes terminal and sound toggles", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/about");
  await page.getByRole("button", { name: "Terminal" }).click();
  await expect(page.getByRole("region", { name: "Terminal" })).toBeVisible();
  const sound = page.getByRole("button", { name: "Ambient sound" });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
});

test("unknown paths show the themed 404 page", async ({ page }) => {
  await explorerVisitor(page);
  const response = await page.goto("/nowhere/at/all");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("No such file or directory");
  await page.getByRole("main").getByRole("link", { name: /back to the desktop/i }).click();
  await expect(page).toHaveURL(/\/$/);
});
