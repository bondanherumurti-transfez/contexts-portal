import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_BASE: "http://localhost:8000" },
}));

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useSites } from "@/lib/hooks/useSites";
import { ApiError } from "@/lib/api/client";

vi.mock("@/lib/api/sites", () => ({
  listSites: vi.fn(),
}));

import { listSites } from "@/lib/api/sites";

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

describe("useSites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses query key ['sites']", async () => {
    const client = makeClient();
    vi.mocked(listSites).mockResolvedValue({ sites: [] });

    const { result } = renderHook(() => useSites(), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(client.getQueryData(["sites"])).toEqual({ sites: [] });
  });

  it("returns sites data on success", async () => {
    const client = makeClient();
    vi.mocked(listSites).mockResolvedValue({
      sites: [
        {
          kb_id: "kb_test_123",
          url: "https://example.com",
          name: "Example",
          token: "kb_test_123",
          created_at: 1234567890,
          last_crawled_at: null,
          pages_indexed: null,
        },
      ],
    });

    const { result } = renderHook(() => useSites(), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.sites).toHaveLength(1);
    expect(result.current.data?.sites[0].kb_id).toBe("kb_test_123");
  });

  it("does not retry on 4xx errors", async () => {
    const client = makeClient();
    const fetchFn = vi.mocked(listSites).mockRejectedValue(
      new ApiError(403, { error: "forbidden" }),
    );

    const { result } = renderHook(() => useSites(), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
