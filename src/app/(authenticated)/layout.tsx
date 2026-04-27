"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { ApiError } from "@/lib/api/client";
import { Spinner } from "@/components/ui/Spinner";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading, error } = useCurrentUser();

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      router.replace("/login");
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

  return <>{children}</>;
}
