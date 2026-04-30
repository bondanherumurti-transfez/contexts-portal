"use client";

import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    let redirecting = false;
    const client = new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => {
          if (error instanceof ApiError && error.status === 401 && !redirecting) {
            redirecting = true;
            client.clear();
            window.location.replace("/login");
          }
        },
      }),
      defaultOptions: {
        queries: {
          staleTime: 30 * 1000,
          retry: (failureCount, error: unknown) => {
            if (
              error instanceof Error &&
              "status" in error &&
              typeof (error as { status: number }).status === "number" &&
              (error as { status: number }).status >= 400 &&
              (error as { status: number }).status < 500
            ) {
              return false;
            }
            return failureCount < 1;
          },
          refetchOnWindowFocus: true,
        },
        mutations: {
          retry: 0,
        },
      },
    });
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
