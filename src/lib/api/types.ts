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
