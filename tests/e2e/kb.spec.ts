import { test, expect } from "@playwright/test";

const FAKE_SITE = {
  kb_id: "kb_finfloo",
  url: "https://finfloo.com",
  name: "Finfloo",
  token: "kb_finfloo",
  created_at: 1777300000,
  last_crawled_at: 1714521600,
  pages_indexed: 12,
};

const FAKE_KB = {
  kb_id: "kb_finfloo",
  company_profile: {
    name: "Finfloo",
    industry: "Accounting & bookkeeping",
    services: "Monthly bookkeeping, tax filing, payroll",
    out_of_scope: "Investment advisory",
    summary: "Indonesian SMB bookkeeping firm",
    last_crawled_at: 1714521600,
    pages_indexed: 12,
  },
  enriched_chunks: [
    {
      id: "c1",
      question: "What are your prices?",
      answer: "Starts at IDR 2.5M/month",
      word_count: 5,
    },
  ],
  pills: ["Daftar sekarang", "Lihat harga", "Hubungi kami"],
  greeting: "Halo, ada yang bisa kami bantu?",
  custom_instructions: null,
};

function mockAuth(page: import("@playwright/test").Page) {
  page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user_id: "usr_1",
        email: "bondan@test.com",
        display_name: "bondan",
      }),
    }),
  );
  page.route("**/api/portal/sites", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ sites: [FAKE_SITE] }),
    }),
  );
  page.route("**/api/portal/kb*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FAKE_KB),
    }),
  );
}

test.describe("knowledge tab", () => {
  test("renders company profile", async ({ page }) => {
    mockAuth(page);
    await page.goto("/knowledge-base/knowledge");

    await expect(page.getByText("Finfloo")).toBeVisible();
    await expect(page.getByText("Accounting & bookkeeping")).toBeVisible();
    await expect(page.getByText("Monthly bookkeeping, tax filing, payroll")).toBeVisible();
  });

  test("renders enriched Q&A", async ({ page }) => {
    mockAuth(page);
    await page.goto("/knowledge-base/knowledge");

    await expect(page.getByText("What are your prices?")).toBeVisible();
    await expect(page.getByText("Starts at IDR 2.5M/month")).toBeVisible();
  });

  test("shows entry count footer", async ({ page }) => {
    mockAuth(page);
    await page.goto("/knowledge-base/knowledge");

    await expect(page.getByText(/1 entry/)).toBeVisible();
  });

  test("gaps section hidden when no gaps", async ({ page }) => {
    mockAuth(page);
    await page.goto("/knowledge-base/knowledge");

    await expect(
      page.getByText("gaps the AI doesn't know yet"),
    ).not.toBeVisible();
  });

  test("opens add Q&A modal", async ({ page }) => {
    mockAuth(page);
    await page.goto("/knowledge-base/knowledge");

    await page.getByRole("button", { name: "+ add Q&A" }).click();
    await expect(
      page.getByText("add a question & answer"),
    ).toBeVisible();
  });

  test("submits new Q&A and closes modal", async ({ page }) => {
    mockAuth(page);
    let enrichCalled = false;
    page.route("**/api/portal/kb/enrich", (route) => {
      enrichCalled = true;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ name: "Finfloo" }),
      });
    });
    await page.goto("/knowledge-base/knowledge");

    await page.getByRole("button", { name: "+ add Q&A" }).click();
    await page.getByPlaceholder("what are your prices for monthly bookkeeping?").fill("test q");
    await page.getByPlaceholder("starts at IDR 2.5M/month for businesses under 100 transactions...").fill("test a");
    await page.getByRole("button", { name: "add to knowledge" }).click();

    await expect(
      page.getByText("add a question & answer"),
    ).not.toBeVisible();
    expect(enrichCalled).toBe(true);
  });
});

test.describe("engagement tab", () => {
  test("renders greeting and pills from API", async ({ page }) => {
    mockAuth(page);
    await page.goto("/knowledge-base/engagement");

    await expect(
      page.getByDisplayValue("Halo, ada yang bisa kami bantu?"),
    ).toBeVisible();
    await expect(page.getByDisplayValue("Daftar sekarang")).toBeVisible();
    await expect(page.getByDisplayValue("Lihat harga")).toBeVisible();
    await expect(page.getByDisplayValue("Hubungi kami")).toBeVisible();
  });

  test("renders pill preview", async ({ page }) => {
    mockAuth(page);
    await page.goto("/knowledge-base/engagement");

    await expect(page.getByText("how this looks on your site.")).toBeVisible();
  });

  test("saves greeting on blur", async ({ page }) => {
    mockAuth(page);
    let greetingPayload: unknown;
    page.route("**/api/portal/kb/greeting", (route) => {
      greetingPayload = route.request().postDataJSON();
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/knowledge-base/engagement");
    const textarea = page.getByDisplayValue("Halo, ada yang bisa kami bantu?");
    await textarea.fill("New greeting");
    await textarea.blur();

    await page.waitForTimeout(700);
    expect(greetingPayload).toMatchObject({ greeting: "New greeting" });
  });
});

test.describe("behavior tab", () => {
  test("renders custom instructions textarea", async ({ page }) => {
    mockAuth(page);
    page.route("**/api/portal/kb*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...FAKE_KB, custom_instructions: "always respond in Bahasa" }),
      }),
    );
    await page.goto("/knowledge-base/behavior");

    await expect(
      page.getByDisplayValue("always respond in Bahasa"),
    ).toBeVisible();
  });

  test("hides examples when instructions are filled", async ({ page }) => {
    mockAuth(page);
    page.route("**/api/portal/kb*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...FAKE_KB, custom_instructions: "some instructions" }),
      }),
    );
    await page.goto("/knowledge-base/behavior");

    await expect(page.getByText("examples")).not.toBeVisible();
  });

  test("shows examples when instructions are empty", async ({ page }) => {
    mockAuth(page);
    await page.goto("/knowledge-base/behavior");

    await expect(page.getByText("examples")).toBeVisible();
    await expect(page.getByText("tone")).toBeVisible();
  });

  test("shows warning box", async ({ page }) => {
    mockAuth(page);
    await page.goto("/knowledge-base/behavior");

    await expect(
      page.getByText(/these layer on top of the contextus engagement model/),
    ).toBeVisible();
  });

  test("clears instructions on reset", async ({ page }) => {
    mockAuth(page);
    let resetPayload: unknown;
    page.route("**/api/portal/kb/custom-instructions", (route) => {
      resetPayload = route.request().postDataJSON();
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    page.route("**/api/portal/kb*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...FAKE_KB, custom_instructions: "some text" }),
      }),
    );

    await page.goto("/knowledge-base/behavior");
    await page.getByRole("button", { name: "reset to default" }).click();

    await page.waitForTimeout(300);
    expect(resetPayload).toMatchObject({ custom_instructions: null });
  });
});

test.describe("KB topbar metadata", () => {
  test("shows last crawled date and page count on KB route", async ({ page }) => {
    mockAuth(page);
    await page.goto("/knowledge-base/knowledge");

    await expect(page.getByText(/12 pages/)).toBeVisible();
  });
});
