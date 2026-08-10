import { test, expect } from "@playwright/test";

test("should display home page and load jobs", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Scout/);
  
  const header = page.locator("header");
  await expect(header).toBeVisible();

  const title = page.locator("h1", { hasText: "Vagas Encontradas" });
  await expect(title).toBeVisible();
});
