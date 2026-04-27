import { describe, it, expect, vi, afterEach } from "vitest";
import { apiClient, ApiError } from "@/lib/api/client";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_BASE: "http://localhost:8000" },
}));

function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  return vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get: (key: string) => {
        const normalized: Record<string, string> = {
          "content-type": "application/json",
          ...headers,
        };
        return normalized[key.toLowerCase()] ?? null;
      },
    },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(String(body)),
  });
}

describe("apiClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("request shape", () => {
    it("prepends API base URL", async () => {
      const fetch = mockFetch(200, { ok: true });
      vi.stubGlobal("fetch", fetch);

      await apiClient.get("/api/auth/me");

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/auth/me",
        expect.any(Object),
      );
    });

    it("always sets credentials: include", async () => {
      const fetch = mockFetch(200, {});
      vi.stubGlobal("fetch", fetch);

      await apiClient.get("/api/auth/me");

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ credentials: "include" }),
      );
    });

    it("sets Content-Type: application/json for POST with body", async () => {
      const fetch = mockFetch(200, {});
      vi.stubGlobal("fetch", fetch);

      await apiClient.post("/api/auth/logout", { foo: "bar" });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("does not set Content-Type for GET requests", async () => {
      const fetch = mockFetch(200, {});
      vi.stubGlobal("fetch", fetch);

      await apiClient.get("/api/auth/me");

      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(init.headers?.["Content-Type"]).toBeUndefined();
    });

    it("appends query params to URL", async () => {
      const fetch = mockFetch(200, { sessions: [] });
      vi.stubGlobal("fetch", fetch);

      await apiClient.get("/api/portal/sessions", {
        params: { kb_id: "kb_finfloo", limit: 50 },
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/portal/sessions?kb_id=kb_finfloo&limit=50",
        expect.any(Object),
      );
    });

    it("omits undefined query params", async () => {
      const fetch = mockFetch(200, {});
      vi.stubGlobal("fetch", fetch);

      await apiClient.get("/api/portal/sessions", {
        params: { kb_id: "kb_finfloo", cursor: undefined },
      });

      const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).not.toContain("cursor");
    });
  });

  describe("response handling", () => {
    it("returns parsed JSON on 2xx", async () => {
      vi.stubGlobal("fetch", mockFetch(200, { user_id: "usr_1", email: "a@b.com" }));

      const result = await apiClient.get("/api/auth/me");

      expect(result).toEqual({ user_id: "usr_1", email: "a@b.com" });
    });

    it("throws ApiError with status and body on 4xx", async () => {
      vi.stubGlobal("fetch", mockFetch(403, { error: "forbidden" }));

      await expect(apiClient.get("/api/portal/sites")).rejects.toMatchObject({
        status: 403,
        body: { error: "forbidden" },
      });
    });

    it("throws ApiError on 5xx", async () => {
      vi.stubGlobal("fetch", mockFetch(500, { error: "internal" }));

      await expect(apiClient.get("/api/auth/me")).rejects.toBeInstanceOf(ApiError);
    });

    it("ApiError.name is ApiError", async () => {
      vi.stubGlobal("fetch", mockFetch(400, {}));

      try {
        await apiClient.get("/api/auth/me");
      } catch (e) {
        expect((e as ApiError).name).toBe("ApiError");
      }
    });
  });

  describe("401 handling", () => {
    it("throws ApiError with status 401", async () => {
      vi.stubGlobal("fetch", mockFetch(401, { error: "unauthenticated" }));

      await expect(apiClient.get("/api/auth/me")).rejects.toMatchObject({
        status: 401,
      });
    });
  });
});
