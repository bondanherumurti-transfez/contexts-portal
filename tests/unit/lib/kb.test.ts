import { describe, it, expect, vi, afterEach } from "vitest";
import { getKB, enrichKB, updatePills, updateGreeting, updateCustomInstructions } from "@/lib/api/kb";
import { apiClient, ApiError } from "@/lib/api/client";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_BASE: "http://localhost:8000" },
}));

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const FAKE_KB = {
  kb_id: "kb_test",
  company_profile: {
    name: "Finfloo",
    industry: "Accounting",
    services: "Bookkeeping, Tax",
    out_of_scope: "Investment",
    summary: "Indonesian SMB firm",
    last_crawled_at: 1700000000,
    pages_indexed: 12,
  },
  enriched_chunks: [
    { id: "c1", question: "What is your price?", answer: "IDR 2.5M/month", word_count: 4 },
  ],
  pills: ["Daftar sekarang", "Lihat harga", "Hubungi kami"],
  greeting: "Halo, ada yang bisa kami bantu?",
  custom_instructions: null,
};

describe("kb API module", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getKB", () => {
    it("calls GET /api/portal/kb with kb_id param", async () => {
      vi.mocked(apiClient.get).mockResolvedValue(FAKE_KB);

      const result = await getKB("kb_test");

      expect(apiClient.get).toHaveBeenCalledWith("/api/portal/kb", {
        params: { kb_id: "kb_test" },
      });
      expect(result).toEqual(FAKE_KB);
    });

    it("propagates ApiError on 403", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError(403, { error: "forbidden" }));

      await expect(getKB("kb_other")).rejects.toThrow(ApiError);
    });
  });

  describe("enrichKB", () => {
    it("calls POST /api/portal/kb/enrich with correct body", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ name: "Finfloo" });

      await enrichKB("kb_test", "What are prices?", "IDR 2.5M/month");

      expect(apiClient.post).toHaveBeenCalledWith("/api/portal/kb/enrich", {
        kb_id: "kb_test",
        question: "What are prices?",
        answer: "IDR 2.5M/month",
      });
    });

    it("propagates 429 rate limit error", async () => {
      vi.mocked(apiClient.post).mockRejectedValue(
        new ApiError(429, { error: "rate_limit_exceeded" }),
      );

      await expect(enrichKB("kb_test", "q", "a")).rejects.toThrow(ApiError);
    });
  });

  describe("updatePills", () => {
    it("calls PATCH /api/portal/kb/pills with pills array", async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ ok: true });

      await updatePills("kb_test", ["pill1", "pill2", "pill3"]);

      expect(apiClient.patch).toHaveBeenCalledWith("/api/portal/kb/pills", {
        kb_id: "kb_test",
        pills: ["pill1", "pill2", "pill3"],
      });
    });
  });

  describe("updateGreeting", () => {
    it("calls PATCH /api/portal/kb/greeting with greeting string", async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ ok: true });

      await updateGreeting("kb_test", "Halo!");

      expect(apiClient.patch).toHaveBeenCalledWith("/api/portal/kb/greeting", {
        kb_id: "kb_test",
        greeting: "Halo!",
      });
    });

    it("sends null to clear greeting", async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ ok: true });

      await updateGreeting("kb_test", null);

      expect(apiClient.patch).toHaveBeenCalledWith("/api/portal/kb/greeting", {
        kb_id: "kb_test",
        greeting: null,
      });
    });
  });

  describe("updateCustomInstructions", () => {
    it("calls PATCH /api/portal/kb/custom-instructions with value", async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ ok: true });

      await updateCustomInstructions("kb_test", "always respond in Bahasa");

      expect(apiClient.patch).toHaveBeenCalledWith(
        "/api/portal/kb/custom-instructions",
        { kb_id: "kb_test", custom_instructions: "always respond in Bahasa" },
      );
    });

    it("sends null to clear custom instructions", async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ ok: true });

      await updateCustomInstructions("kb_test", null);

      expect(apiClient.patch).toHaveBeenCalledWith(
        "/api/portal/kb/custom-instructions",
        { kb_id: "kb_test", custom_instructions: null },
      );
    });
  });
});
