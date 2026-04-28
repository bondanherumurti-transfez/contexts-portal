import { test, expect } from "@playwright/test";

const FAKE_USER = {
  user_id: "usr_1",
  email: "bondan@test.com",
  display_name: "bondan",
};

const ACTIVE_SITE = {
  kb_id: "kb_finfloo",
  url: "https://finfloo.com",
  name: "finfloo",
  token: "tok_finfloo",
  created_at: 1777300000,
  last_crawled_at: 1714521600,
  pages_indexed: 12,
};

const PENDING_SITE = {
  kb_id: "kb_rubyh",
  url: "https://rubyh.dev",
  name: "rubyh",
  token: "tok_rubyh",
  created_at: 1777300000,
  last_crawled_at: null,
  pages_indexed: null,
};

function mockAuth(page: import("@playwright/test").Page, sites: object[]) {
  page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FAKE_USER),
    }),
  );
  page.route("**/api/portal/sites", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ sites }),
    }),
  );
}

test("empty state shows account-ready message and sign-out", async ({
  page,
}) => {
  mockAuth(page, []);
  await page.goto("/sites");
  await expect(page.getByText("your account is ready")).toBeVisible();
  await expect(page.getByText("signed in as bondan@test.com")).toBeVisible();
  await expect(page.getByRole("button", { name: "sign out" })).toBeVisible();
});

test("populated state renders SiteCard for each site", async ({ page }) => {
  mockAuth(page, [ACTIVE_SITE, PENDING_SITE]);
  await page.goto("/sites");

  await expect(page.getByText("finfloo")).toBeVisible();
  await expect(page.getByText(/finfloo\.com.*12 pages indexed/)).toBeVisible();
  await expect(page.getByRole("button", { name: "manage" })).toBeVisible();

  await expect(page.getByText("rubyh")).toBeVisible();
  await expect(page.getByRole("button", { name: "activate" })).toBeVisible();
});

test("populated state shows embed snippet with correct kb_id", async ({
  page,
}) => {
  mockAuth(page, [ACTIVE_SITE]);
  await page.goto("/sites");

  await expect(
    page.getByText(/data-knowledge-base-id="kb_finfloo"/),
  ).toBeVisible();
});

test("populated state shows add-new-site placeholder", async ({ page }) => {
  mockAuth(page, [ACTIVE_SITE]);
  await page.goto("/sites");

  await expect(page.getByText("+ add new site")).toBeVisible();
});

test("manage button navigates to knowledge-base", async ({ page }) => {
  mockAuth(page, [ACTIVE_SITE]);
  page.route("**/api/portal/kb/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await page.goto("/sites");

  await page.getByRole("button", { name: "manage" }).click();
  await expect(page).toHaveURL(/\/knowledge-base/);
});
