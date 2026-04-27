import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { createElement } from "react";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_BASE: "http://localhost:8000" },
}));

const { mockRouterReplace, mockUseCurrentUser } = vi.hoisted(() => ({
  mockRouterReplace: vi.fn(),
  mockUseCurrentUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
}));

vi.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: mockUseCurrentUser,
}));

vi.mock("@/lib/hooks/useSites", () => ({
  useSites: () => ({ data: undefined }),
}));

vi.mock("@/components/shell/Sidebar", () => ({
  Sidebar: () => null,
}));

vi.mock("@/components/shell/Topbar", () => ({
  Topbar: () => null,
}));

import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { ApiError } from "@/lib/api/client";

function layout() {
  return createElement(AuthenticatedLayout, null, createElement("div", null, "protected"));
}

describe("AuthenticatedLayout (auth guard)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows spinner while loading", () => {
    mockUseCurrentUser.mockReturnValue({ data: undefined, isLoading: true, error: null });

    const { getByLabelText } = render(layout());

    expect(getByLabelText("Loading")).toBeDefined();
  });

  it("renders children when user is authenticated", () => {
    mockUseCurrentUser.mockReturnValue({
      data: { user_id: "usr_1", email: "a@b.com", display_name: null },
      isLoading: false,
      error: null,
    });

    const { getByText } = render(layout());

    expect(getByText("protected")).toBeDefined();
  });

  it("redirects to /login on 401", () => {
    mockUseCurrentUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new ApiError(401, { error: "unauthenticated" }),
    });

    render(layout());

    expect(mockRouterReplace).toHaveBeenCalledWith("/login");
    expect(mockRouterReplace).not.toHaveBeenCalledWith("/oops");
  });

  it("redirects to /oops on network error", () => {
    mockUseCurrentUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new TypeError("Failed to fetch"),
    });

    render(layout());

    expect(mockRouterReplace).toHaveBeenCalledWith("/oops");
    expect(mockRouterReplace).not.toHaveBeenCalledWith("/login");
  });

  it("redirects to /oops on 500 error", () => {
    mockUseCurrentUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new ApiError(500, { error: "internal server error" }),
    });

    render(layout());

    expect(mockRouterReplace).toHaveBeenCalledWith("/oops");
    expect(mockRouterReplace).not.toHaveBeenCalledWith("/login");
  });

  it("renders nothing (no children, no redirect) when not loading and no user and no error", () => {
    // This is a transient state before the query resolves
    mockUseCurrentUser.mockReturnValue({ data: undefined, isLoading: false, error: null });

    const { queryByText } = render(layout());

    expect(queryByText("protected")).toBeNull();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
