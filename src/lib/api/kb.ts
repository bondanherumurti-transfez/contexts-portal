import { apiClient } from "./client";
import { KBResponse } from "./types";

export function getKB(kb_id: string): Promise<KBResponse> {
  return apiClient.get<KBResponse>("/api/portal/kb", { params: { kb_id } });
}

export function enrichKB(
  kb_id: string,
  question: string,
  answer: string,
): Promise<unknown> {
  return apiClient.post("/api/portal/kb/enrich", { kb_id, question, answer });
}

export function updatePills(
  kb_id: string,
  pills: string[],
): Promise<{ ok: boolean }> {
  return apiClient.patch("/api/portal/kb/pills", { kb_id, pills });
}

export function updateGreeting(
  kb_id: string,
  greeting: string | null,
): Promise<{ ok: boolean }> {
  return apiClient.patch("/api/portal/kb/greeting", { kb_id, greeting });
}

export function updateCustomInstructions(
  kb_id: string,
  custom_instructions: string | null,
): Promise<{ ok: boolean }> {
  return apiClient.patch("/api/portal/kb/custom-instructions", {
    kb_id,
    custom_instructions,
  });
}
