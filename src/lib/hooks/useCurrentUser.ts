import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) return false;
      return failureCount < 1;
    },
  });
}
