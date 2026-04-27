import { apiClient } from "./client";
import { SessionListResponse, SessionDetailResponse } from "./types";

export function listSessions(kb_id: string, cursor?: string): Promise<SessionListResponse> {
  return apiClient.get<SessionListResponse>("/api/portal/sessions", {
    params: { kb_id, limit: 50, cursor },
  });
}

export function getSession(session_id: string): Promise<SessionDetailResponse> {
  return apiClient.get<SessionDetailResponse>(`/api/portal/sessions/${session_id}`);
}
