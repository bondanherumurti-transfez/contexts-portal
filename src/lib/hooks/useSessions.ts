import { useQuery } from "@tanstack/react-query";
import { listSessions } from "@/lib/api/sessions";
import { ApiError } from "@/lib/api/client";

export function useSessions(kb_id: string | undefined) {
  return useQuery({
    queryKey: ["sessions", kb_id],
    queryFn: () => listSessions(kb_id!),
    enabled: !!kb_id,
    staleTime: 30 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status < 500) return false;
      return failureCount < 1;
    },
  });
}
