import { expect, test } from "@playwright/test";
import { destinations } from "../../src/config/site";
import { explorerVisitor } from "./helpers";

test("the camp opens on the entry screen and the button lights the hub", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "BONFIREOS" })).toBeVisible();
  const enter = page.getByTestId("enter");
  await expect(enter).toBeEnabled();
  await enter.click();
  await expect(page.getByRole("navigation", { name: "Destinations" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: /quest archive/i })).toBeVisible();
});

test("skipping the cinematics lands in explorer mode immediately", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /skip the cinematics/i }).click();
  await expect(page.getByRole("navigation", { name: "Destinations" })).toBeVisible({ timeout: 3_000 });
  await expect(page.locator("[data-backdrop]")).toHaveAttribute("data-backdrop", "css");
  // the choice is remembered
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Destinations" })).toBeVisible();
});

test("every destination opens from the hub and Escape returns to the bonfire", async ({ page }) => {
  await explorerVisitor(page);
  for (const d of destinations) {
    await page.goto("/");
    await page.getByRole("link", { name: new RegExp(d.title, "i") }).click();
    await expect(page).toHaveURL(new RegExp(`${d.path}$`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(d.title);
    await expect(page.getByRole("link", { name: /BonfireOS home/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("navigation", { name: "Destinations" })).toBeVisible();
  }
});

test("the hub is fully keyboard navigable", async ({ page }) => {
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
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The Tarnished");
});

test("panel footer walks to the neighbouring destination", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/about");
  await page.getByRole("link", { name: /next destination/i }).click();
  await expect(page).toHaveURL(/\/skills$/);
  await page.getByRole("link", { name: /previous destination/i }).click();
  await expect(page).toHaveURL(/\/about$/);
});

test("a quest dossier deep link renders real repository data", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/projects/CreateOS");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The First Spark");
  const repoLink = page.getByRole("link", { name: /view on github/i });
  await expect(repoLink).toHaveAttribute("href", "https://github.com/0x496C6B696E/CreateOS");
  await expect(repoLink).toHaveAttribute("rel", /noopener/);
  const width = page.viewportSize()?.width ?? 1280;
  if (width >= 768) await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Quest Archive");
  else await expect(page.getByRole("link", { name: /back to the quest archive/i })).toBeVisible();
});

test("the armory inspects a selected item", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/stack");
  await page.getByRole("tab", { name: "Spells" }).click();
  await page.getByRole("button", { name: "Django", exact: true }).click();
  const inspect = page.locator("#armory-inspect");
  await expect(inspect).toContainText("Django");
  await expect(inspect).toContainText("Restaurant-Management-System");
});

test("the character sheet switches tabs with the keyboard", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/skills");
  await page.getByRole("tab", { name: "Attributes" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Creed" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Small diffs", { exact: true })).toBeVisible();
});

test("the contact page only offers real, verified channels", async ({ page }) => {
  await explorerVisitor(page);
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: /open profile/i })).toHaveAttribute("href", "https://github.com/0x496C6B696E");
  await expect(page.getByRole("link", { name: /write/i })).toHaveAttribute("href", /^mailto:0x496c6b696e@proton\.me/);
  await expect(page.locator("form")).toHaveCount(0);
});

test("unknown paths show the themed 404 page", async ({ page }) => {
  await explorerVisitor(page);
  const response = await page.goto("/nowhere/at/all");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Lost in the fog");
  await page.getByRole("main").getByRole("link", { name: /return to the bonfire/i }).click();
  await expect(page).toHaveURL(/\/$/);
});
