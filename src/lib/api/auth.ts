import { apiClient } from "./client";
import type { User } from "./types";

export const getCurrentUser = () =>
  apiClient.get<User>("/api/auth/me");

export const logout = () =>
  apiClient.post<void>("/api/auth/logout");
