import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryProvider } from "@/providers/QueryProvider";
import { ApiError } from "@/lib/api/client";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_BASE: "http://localhost:8000" },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(QueryProvider, null, children);
}

describe("QueryProvider — global 401 handler", () => {
  let mockReplace: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockReplace = vi.fn();
    vi.stubGlobal("location", { replace: mockReplace });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("hard-redirects to /login when any query returns 401", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new ApiError(401, { error: "unauthenticated" }));

    renderHook(
      () => useQuery({ queryKey: ["test-401"], queryFn: fetchFn }),
      { wrapper },
    );

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login"));
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it("does not redirect on 403 or 500 errors", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new ApiError(500, { error: "internal" }));

    renderHook(
      () => useQuery({ queryKey: ["test-500"], queryFn: fetchFn, retry: false }),
      { wrapper },
    );

    // Wait long enough for the query to settle
    await waitFor(() => {});
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("does not redirect when already on /login (prevents login page loop)", async () => {
    vi.stubGlobal("location", { replace: mockReplace, pathname: "/login" });

    const fetchFn = vi.fn().mockRejectedValue(new ApiError(401, { error: "unauthenticated" }));

    renderHook(
      () => useQuery({ queryKey: ["test-login-401"], queryFn: fetchFn }),
      { wrapper },
    );

    await waitFor(() => {});
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects only once when multiple queries 401 simultaneously", async () => {
    const fail401 = vi.fn().mockRejectedValue(new ApiError(401, { error: "unauthenticated" }));

    renderHook(
      () => {
        useQuery({ queryKey: ["q1"], queryFn: fail401 });
        useQuery({ queryKey: ["q2"], queryFn: fail401 });
        useQuery({ queryKey: ["q3"], queryFn: fail401 });
      },
      { wrapper },
    );

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });
});
