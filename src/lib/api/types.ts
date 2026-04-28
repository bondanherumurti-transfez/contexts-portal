// All types must match the backend's Pydantic schemas.
// When backend types change, update these manually.

export interface User {
  user_id: string;
  email: string;
  display_name: string | null;
}

export interface Site {
  kb_id: string;
  url: string | null;
  name: string | null;
  token: string;
  created_at: number;
  last_crawled_at: number | null;
  pages_indexed: number | null;
}

export interface SitesResponse {
  sites: Site[];
}

export type Qualification = "qualified" | "out_of_scope" | "unclear" | "suspicious" | null;
export type QualityScore = "high" | "medium" | "low" | null;

export interface SessionListItem {
  session_id: string;
  created_at: number;
  updated_at: number;
  message_count: number;
  contact_captured: boolean;
  contact_value: string | null;
  preview: string;
  qualification: Qualification;
  quality_score: QualityScore;
  brief_sent: boolean;
}

export interface SessionListResponse {
  sessions: SessionListItem[];
  next_cursor: string | null;
}

export interface Message {
  role: "user" | "assistant" | "bot";
  text?: string;
  content?: string;
}

export interface LeadBrief {
  who: string;
  need: string;
  signals: string;
  open_questions: string;
  suggested_approach: string;
  quality_score: QualityScore;
  qualification: Qualification;
  qualification_reason: string;
  scope_match: string;
  red_flags: string[];
  contact: Record<string, string> | null;
  created_at: string;
}

export interface SessionDetail {
  session_id: string;
  kb_id: string;
  created_at: number;
  updated_at: number;
  message_count: number;
  messages: Message[];
  contact_captured: boolean;
  contact_value: string | null;
  brief_sent: boolean;
}

export interface SessionDetailResponse {
  session: SessionDetail;
  brief: LeadBrief | null;
}

export interface EnrichedChunk {
  id: string;
  question: string;
  answer: string;
  word_count: number;
}

export interface CompanyProfileKB {
  name: string | null;
  industry: string | null;
  services: string | null;
  out_of_scope: string | null;
  summary: string | null;
  last_crawled_at: number | null;
  pages_indexed: number | null;
  gaps?: string[];
}

export interface KBResponse {
  kb_id: string;
  company_profile: CompanyProfileKB | null;
  enriched_chunks: EnrichedChunk[];
  pills: string[];
  greeting: string | null;
  custom_instructions: string | null;
}
