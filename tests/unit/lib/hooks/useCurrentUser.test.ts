import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_BASE: "http://localhost:8000" },
}));
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { ApiError } from "@/lib/api/client";

vi.mock("@/lib/api/auth", () => ({
  getCurrentUser: vi.fn(),
}));

import { getCurrentUser } from "@/lib/api/auth";

function wrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe("useCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses query key ['user']", async () => {
    const client = makeClient();
    vi.mocked(getCurrentUser).mockResolvedValue({
      user_id: "usr_1",
      email: "a@b.com",
      display_name: null,
    });

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: wrapper(client),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Confirm data is cached under the correct key
    expect(client.getQueryData(["user"])).toEqual({
      user_id: "usr_1",
      email: "a@b.com",
      display_name: null,
    });
  });

  it("returns user data on success", async () => {
    const client = makeClient();
    vi.mocked(getCurrentUser).mockResolvedValue({
      user_id: "usr_1",
      email: "a@b.com",
      display_name: "Bondan",
    });

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: wrapper(client),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.email).toBe("a@b.com");
  });

  it("does not retry on 401 ApiError", async () => {
    const client = makeClient();
    const fetchFn = vi.mocked(getCurrentUser).mockRejectedValue(
      new ApiError(401, { error: "unauthenticated" }),
    );

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: wrapper(client),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Should have been called exactly once — no retries
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("retries once on non-401 errors", async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retryDelay: 0,
          // let useCurrentUser's own retry logic run (allows 1 retry on non-401)
        },
      },
    });

    const fetchFn = vi.mocked(getCurrentUser).mockRejectedValue(
      new ApiError(500, { error: "internal" }),
    );

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: wrapper(client),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // 1 original + 1 retry = 2 calls
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
