import { describe, it, expect } from "vitest";
import { relativeTime } from "@/lib/utils";

// Re-export private helpers via a thin test shim — we test them through
// the logic that's exported from utils, and inline the inbox helpers here
// since they're module-private in InboxContent.tsx.

function extractContactValue(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      for (const val of Object.values(parsed)) {
        if (val && typeof val === "string") return val;
      }
      return null;
    }
  } catch {
    // not JSON
  }
  return raw;
}

describe("relativeTime", () => {
  const now = Math.floor(Date.now() / 1000);

  it("returns 'just now' for sub-minute deltas", () => {
    expect(relativeTime(now - 30)).toBe("just now");
  });

  it("returns minutes", () => {
    expect(relativeTime(now - 60 * 5)).toBe("5m");
  });

  it("returns hours", () => {
    expect(relativeTime(now - 3600 * 2)).toBe("2h");
  });

  it("returns days", () => {
    expect(relativeTime(now - 86400 * 3)).toBe("3d");
  });

  it("returns weeks", () => {
    expect(relativeTime(now - 86400 * 14)).toBe("2w");
  });
});

describe("extractContactValue", () => {
  it("returns null for null input", () => {
    expect(extractContactValue(null)).toBeNull();
  });

  it("returns plain string as-is", () => {
    expect(extractContactValue("budi@example.com")).toBe("budi@example.com");
  });

  it("extracts first non-null value from JSON contact object", () => {
    const raw = JSON.stringify({ email: null, phone: "081290570866", whatsapp: null });
    expect(extractContactValue(raw)).toBe("081290570866");
  });

  it("extracts email when it is the first non-null value", () => {
    const raw = JSON.stringify({ email: "budi@example.com", phone: null, whatsapp: null });
    expect(extractContactValue(raw)).toBe("budi@example.com");
  });

  it("returns null when all contact values are null", () => {
    const raw = JSON.stringify({ email: null, phone: null, whatsapp: null });
    expect(extractContactValue(raw)).toBeNull();
  });

  it("returns the raw string when JSON parsing fails", () => {
    expect(extractContactValue("not-json")).toBe("not-json");
  });

  it("returns null for empty string", () => {
    expect(extractContactValue("")).toBeNull();
  });
});
