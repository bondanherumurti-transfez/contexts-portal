"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useSites } from "@/lib/hooks/useSites";
import { ApiError } from "@/lib/api/client";
import { Spinner } from "@/components/ui/Spinner";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading, error } = useCurrentUser();
  const { data: sitesData } = useSites();
  const sites = sitesData?.sites ?? [];

  useEffect(() => {
    if (!error) return;
    if (error instanceof ApiError && error.status === 401) {
      router.replace("/login");
    } else {
      router.replace("/oops");
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar hasSites={sites.length > 0} />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar sites={sites} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
