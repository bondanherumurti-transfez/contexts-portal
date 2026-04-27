import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_BASE: "http://localhost:8000" },
}));

const { mockPathname, mockRouterReplace } = vi.hoisted(() => ({
  mockPathname: vi.fn(() => "/inbox"),
  mockRouterReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockPathname,
  useRouter: () => ({ replace: mockRouterReplace }),
  // Link uses href directly in jsdom
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    createElement("a", { href, className }, children),
}));

vi.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: { user_id: "usr_1", email: "a@b.com", display_name: "Alice Bob" },
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ removeQueries: vi.fn() }),
}));

vi.mock("@/lib/api/auth", () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

import { Sidebar } from "@/components/shell/Sidebar";

describe("Sidebar", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/inbox");
    vi.clearAllMocks();
  });

  it("renders all nav items", () => {
    render(createElement(Sidebar, { hasSites: true }));

    expect(screen.getByText("inbox")).toBeDefined();
    expect(screen.getByText("knowledge base")).toBeDefined();
    expect(screen.getByText("analytics")).toBeDefined();
    expect(screen.getByText("sites")).toBeDefined();
  });

  it("renders contextus logo text", () => {
    render(createElement(Sidebar, { hasSites: true }));
    expect(screen.getByText("contextus")).toBeDefined();
  });

  it("shows user first name", () => {
    render(createElement(Sidebar, { hasSites: true }));
    expect(screen.getByText("Alice")).toBeDefined();
  });

  it("disables inbox and KB when hasSites is false", () => {
    render(createElement(Sidebar, { hasSites: false }));

    // When hasSites=false, inbox and knowledge base are divs (not links)
    const inboxEl = screen.getByText("inbox");
    expect(inboxEl.tagName).toBe("DIV");

    const kbEl = screen.getByText("knowledge base");
    expect(kbEl.tagName).toBe("DIV");
  });

  it("keeps sites as a link when hasSites is false", () => {
    render(createElement(Sidebar, { hasSites: false }));

    const sitesEl = screen.getByText("sites");
    expect(sitesEl.tagName).toBe("A");
  });

  it("analytics is always disabled regardless of hasSites", () => {
    render(createElement(Sidebar, { hasSites: true }));

    const analyticsEl = screen.getByText("analytics");
    expect(analyticsEl.tagName).toBe("DIV");
  });
});
