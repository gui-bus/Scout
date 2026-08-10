import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/jobs/stats", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        totalToday: 15,
        bySource: {
          gupy: 5,
          solides: 3,
          remotar: 2,
          jooble: 2,
          github: 2,
          remotive: 1,
        },
      }),
    });
  });

  await page.route("**/api/auth/resume", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        skills: ["React", "TypeScript", "Node.js"],
        personalInfo: {
          location: "São Paulo, SP",
          summary: "Desenvolvedor frontend",
        },
        experiences: [
          {
            position: "Frontend Developer",
          },
        ],
      }),
    });
  });

  await page.route("**/api/jobs?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: 1,
            title: "Desenvolvedor React Pleno",
            description: "React, TypeScript, Tailwind",
            company: "Google",
            location: "São Paulo, SP",
            modality: "Presencial",
            level: "Pleno",
            technologies: "React,TypeScript",
            source: "Gupy",
            link: "http://example.com/1",
            publishedAt: new Date().toISOString(),
            collectedAt: new Date().toISOString(),
          },
          {
            id: 2,
            title: "Node.js Backend Developer",
            description: "Node.js, Express, Prisma",
            company: "Amazon",
            location: "Rio de Janeiro, RJ",
            modality: "Remoto",
            level: "Sênior",
            technologies: "Node.js,Express",
            source: "GitHub",
            link: "http://example.com/2",
            publishedAt: new Date().toISOString(),
            collectedAt: new Date().toISOString(),
          },
        ],
        pagination: {
          page: 1,
          perPage: 10,
          total: 2,
          pages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }),
    });
  });
});

test("renders dashboard elements correctly", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Scout/);
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("h1", { hasText: "Vagas Encontradas" })).toBeVisible();
});

test("updates URL query parameters on search input change", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.locator("input[placeholder='Ex: Node.js, React, Python']");
  await searchInput.fill("React");
  await searchInput.press("Enter");
  await expect(page).toHaveURL(/busca=React/);
});

test("renders the match score slider filter when resume is loaded", async ({ page }) => {
  await page.goto("/");
  const sliderLabel = page.locator("label", { hasText: "Compatibilidade Mínima" });
  await expect(sliderLabel).toBeVisible();
  const sliderTrack = page.locator(".relative.w-full.grow");
  await expect(sliderTrack).toBeVisible();
});
