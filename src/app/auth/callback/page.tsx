"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { Spinner } from "@/components/ui/Spinner";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then(() => router.replace("/inbox"))
      .catch(() => router.replace("/login?error=auth_failed"));
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary">
      <Spinner size="lg" />
    </div>
  );
}
