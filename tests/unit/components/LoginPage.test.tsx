import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement } from "react";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_BASE: "http://localhost:8000" },
}));

// vi.hoisted lets us reference these fns inside the vi.mock factory below
const { mockUseSearchParams, mockRouterReplace } = vi.hoisted(() => ({
  mockUseSearchParams: vi.fn(() => new URLSearchParams()),
  mockRouterReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
  useSearchParams: mockUseSearchParams,
}));

vi.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ data: undefined, isLoading: false, error: null }),
}));

import LoginPage from "@/app/login/page";

describe("LoginPage", () => {
  beforeEach(() => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockRouterReplace.mockReset();

    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });
  });

  it("renders the continue with google button", () => {
    render(createElement(LoginPage));
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeDefined();
  });

  it("renders contextus portal title", () => {
    render(createElement(LoginPage));
    expect(screen.getByText("contextus portal")).toBeDefined();
  });

  it("shows error banner when ?error=auth_failed is present", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("error=auth_failed"));

    render(createElement(LoginPage));

    expect(screen.getByText(/sign-in failed/i)).toBeDefined();
  });

  it("does not show error banner without error param", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    render(createElement(LoginPage));

    expect(screen.queryByText(/sign-in failed/i)).toBeNull();
  });

  it("shows not_invited banner when ?error=not_invited is present", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("error=not_invited"));

    render(createElement(LoginPage));

    expect(screen.getByText(/hasn't been set up yet/i)).toBeDefined();
  });

  it("google button navigates to OAuth start URL", () => {
    render(createElement(LoginPage));

    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    expect(window.location.href).toBe(
      "http://localhost:8000/api/auth/google/start",
    );
  });
});
