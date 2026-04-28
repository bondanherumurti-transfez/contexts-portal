import { test, expect } from "@playwright/test";

const SESSION_LIST = {
  sessions: [
    {
      session_id: "sess_aaa",
      created_at: 1777300000,
      updated_at: 1777300000,
      message_count: 6,
      contact_captured: true,
      contact_value: JSON.stringify({ email: null, phone: "081290570866", whatsapp: null }),
      preview: "do you handle restaurants?",
      qualification: "qualified",
      quality_score: "high",
      brief_sent: true,
    },
    {
      session_id: "sess_bbb",
      created_at: 1777200000,
      updated_at: 1777200000,
      message_count: 3,
      contact_captured: false,
      contact_value: null,
      preview: "price comparison only",
      qualification: "unclear",
      quality_score: null,
      brief_sent: false,
    },
  ],
  next_cursor: null,
};

const SESSION_WITH_BRIEF = {
  session: {
    session_id: "sess_aaa",
    kb_id: "finfloo",
    created_at: 1777300000,
    updated_at: 1777300000,
    message_count: 6,
    messages: [
      { role: "bot", text: "halo, ada yang bisa kami bantu?" },
      { role: "user", text: "do you handle restaurants?" },
    ],
    contact_captured: true,
    contact_value: JSON.stringify({ email: null, phone: "081290570866", whatsapp: null }),
    brief_sent: true,
  },
  brief: {
    who: "restaurant owner",
    need: "monthly bookkeeping",
    signals: "has budget",
    open_questions: "",
    suggested_approach: "",
    quality_score: "high",
    qualification: "qualified",
    qualification_reason: "",
    scope_match: "",
    red_flags: [],
    contact: { phone: "081290570866" },
    created_at: "2026-04-27T00:00:00Z",
  },
};

const SESSION_NO_BRIEF = {
  session: {
    session_id: "sess_bbb",
    kb_id: "finfloo",
    created_at: 1777200000,
    updated_at: 1777200000,
    message_count: 3,
    messages: [
      { role: "bot", text: "halo!" },
      { role: "user", text: "price comparison only" },
    ],
    contact_captured: false,
    contact_value: null,
    brief_sent: false,
  },
  brief: null,
};

function mockAuth(page: import("@playwright/test").Page) {
  page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user_id: "usr_1", email: "bondan@test.com", display_name: "bondan" }),
    })
  );
  page.route("**/api/portal/sites", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        sites: [
          {
            kb_id: "finfloo",
            url: "https://finfloo.com",
            name: "Finfloo",
            token: "finfloo",
            created_at: 1777300000,
            last_crawled_at: 1777300000,
            pages_indexed: 12,
          },
        ],
      }),
    })
  );
}

test.describe("Inbox", () => {
  test("renders session list with parsed contact names", async ({ page }) => {
    mockAuth(page);
    page.route("**/api/portal/sessions?**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION_LIST),
      })
    );
    page.route("**/api/portal/sessions/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION_WITH_BRIEF),
      })
    );

    await page.goto("/inbox");

    // Contact JSON is parsed — phone number shown, not raw JSON
    await expect(page.getByText("081290570866").first()).toBeVisible();
    // Anonymous for null contact
    await expect(page.getByText("anonymous")).toBeVisible();
    // Qualification tags render
    await expect(page.getByText("qualified")).toBeVisible();
    await expect(page.getByText("unclear")).toBeVisible();
  });

  test("clicking a session loads the brief panel", async ({ page }) => {
    mockAuth(page);
    page.route("**/api/portal/sessions?**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION_LIST),
      })
    );
    page.route("**/api/portal/sessions/sess_aaa", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION_WITH_BRIEF),
      })
    );

    await page.goto("/inbox");
    await page.getByText("do you handle restaurants?").click();

    // URL updated
    await expect(page).toHaveURL(/session=sess_aaa/);
    // Brief panel renders key rows
    await expect(page.getByText("restaurant owner")).toBeVisible();
    await expect(page.getByText("monthly bookkeeping")).toBeVisible();
    // Contact value extracted from JSON object
    await expect(page.getByText("081290570866").first()).toBeVisible();
    // Transcript renders
    await expect(page.getByText("do you handle restaurants?")).toBeVisible();
  });

  test("shows no-brief panel when brief is null", async ({ page }) => {
    mockAuth(page);
    page.route("**/api/portal/sessions?**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION_LIST),
      })
    );
    page.route("**/api/portal/sessions/sess_bbb", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION_NO_BRIEF),
      })
    );

    await page.goto("/inbox");
    await page.getByText("price comparison only").click();

    await expect(page).toHaveURL(/session=sess_bbb/);
    await expect(page.getByText("no lead brief for this conversation")).toBeVisible();
    await expect(page.getByText("not captured")).toBeVisible();
  });

  test("direct URL visit loads session and allows navigating to another", async ({ page }) => {
    mockAuth(page);
    page.route("**/api/portal/sessions?**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION_LIST),
      })
    );
    page.route("**/api/portal/sessions/sess_aaa", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION_WITH_BRIEF),
      })
    );
    page.route("**/api/portal/sessions/sess_bbb", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION_NO_BRIEF),
      })
    );

    // Direct URL visit (the bug: navigation was broken after hard load)
    await page.goto("/inbox?session=sess_aaa");
    await expect(page.getByText("restaurant owner")).toBeVisible();

    // Click a different session — must navigate (this was the regression)
    await page.getByText("price comparison only").click();
    await expect(page).toHaveURL(/session=sess_bbb/);
    await expect(page.getByText("no lead brief for this conversation")).toBeVisible();
  });

  test("search filters session list client-side", async ({ page }) => {
    mockAuth(page);
    page.route("**/api/portal/sessions?**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION_LIST),
      })
    );

    await page.goto("/inbox");
    // Both sessions visible initially
    await expect(page.getByText("do you handle restaurants?")).toBeVisible();
    await expect(page.getByText("price comparison only")).toBeVisible();

    // Type into search box
    await page.getByPlaceholder("search").fill("restaurant");
    await expect(page.getByText("do you handle restaurants?")).toBeVisible();
    await expect(page.getByText("price comparison only")).not.toBeVisible();

    // Clear search — both back
    await page.getByPlaceholder("search").fill("");
    await expect(page.getByText("price comparison only")).toBeVisible();
  });

  test("search with no results shows 'no results' message", async ({ page }) => {
    mockAuth(page);
    page.route("**/api/portal/sessions?**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION_LIST),
      })
    );

    await page.goto("/inbox");
    await page.getByPlaceholder("search").fill("zzznomatch");
    await expect(page.getByText("no results")).toBeVisible();
  });

  test("load older button fetches next page and appends sessions", async ({ page }) => {
    mockAuth(page);

    const PAGE_ONE = {
      sessions: [
        {
          session_id: "sess_aaa",
          created_at: 1777300000,
          updated_at: 1777300000,
          message_count: 6,
          contact_captured: true,
          contact_value: JSON.stringify({ email: null, phone: "081290570866", whatsapp: null }),
          preview: "do you handle restaurants?",
          qualification: "qualified",
          quality_score: "high",
          brief_sent: true,
        },
      ],
      next_cursor: "cursor_page2",
    };

    const PAGE_TWO = {
      sessions: [
        {
          session_id: "sess_ccc",
          created_at: 1777100000,
          updated_at: 1777100000,
          message_count: 2,
          contact_captured: false,
          contact_value: null,
          preview: "older session message",
          qualification: "unclear",
          quality_score: null,
          brief_sent: false,
        },
      ],
      next_cursor: null,
    };

    let callCount = 0;
    page.route("**/api/portal/sessions?**", (route) => {
      callCount++;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(callCount === 1 ? PAGE_ONE : PAGE_TWO),
      });
    });

    await page.goto("/inbox");
    await expect(page.getByText("do you handle restaurants?")).toBeVisible();
    await expect(page.getByRole("button", { name: "load older" })).toBeVisible();

    await page.getByRole("button", { name: "load older" }).click();

    // Second page appended — both sessions visible, button gone
    await expect(page.getByText("older session message")).toBeVisible();
    await expect(page.getByRole("button", { name: "load older" })).not.toBeVisible();
  });

  test("shows empty state with embed snippet when no sessions", async ({ page }) => {
    mockAuth(page);
    page.route("**/api/portal/sessions?**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ sessions: [], next_cursor: null }),
      })
    );

    await page.goto("/inbox");
    await expect(page.getByText("no conversations yet")).toBeVisible();
    await expect(page.getByText(/floating\.js/)).toBeVisible();
  });
});
