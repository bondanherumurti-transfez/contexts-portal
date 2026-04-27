import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/api/sessions";
import { ApiError } from "@/lib/api/client";

export function useSession(session_id: string | null) {
  return useQuery({
    queryKey: ["session", session_id],
    queryFn: () => getSession(session_id!),
    enabled: !!session_id,
    staleTime: 30 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status < 500) return false;
      return failureCount < 1;
    },
  });
}
