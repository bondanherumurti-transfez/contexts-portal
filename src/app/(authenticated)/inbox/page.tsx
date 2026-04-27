"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { logout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function InboxPage() {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await logout();
    queryClient.removeQueries({ queryKey: ["user"] });
    router.replace("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-[13px] text-text-body mb-1">
          signed in as{" "}
          <span className="font-medium">{user?.email}</span>
        </p>
        {user?.display_name && (
          <p className="text-[11px] text-text-muted mb-4">{user.display_name}</p>
        )}
        <button
          onClick={handleSignOut}
          className="text-[11px] text-text-muted font-mono hover:text-text-body transition-colors"
        >
          sign out
        </button>
      </div>
    </div>
  );
}
