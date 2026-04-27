import { useQuery } from "@tanstack/react-query";
import { listSites } from "@/lib/api/sites";
import { ApiError } from "@/lib/api/client";

export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: listSites,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status < 500) return false;
      return failureCount < 1;
    },
  });
}
