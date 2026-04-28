import { useInfiniteQuery } from "@tanstack/react-query";
import { listSessions } from "@/lib/api/sessions";
import { ApiError } from "@/lib/api/client";

export function useSessions(kb_id: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["sessions", kb_id],
    queryFn: ({ pageParam }) => listSessions(kb_id!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: !!kb_id,
    staleTime: 30 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status < 500) return false;
      return failureCount < 1;
    },
  });
}
