import { apiClient } from "./client";
import type { SitesResponse } from "./types";

export const listSites = () =>
  apiClient.get<SitesResponse>("/api/portal/sites");
