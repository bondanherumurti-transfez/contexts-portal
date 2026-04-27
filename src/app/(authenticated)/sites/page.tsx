"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useSites } from "@/lib/hooks/useSites";
import { logout } from "@/lib/api/auth";
import { Spinner } from "@/components/ui/Spinner";

export default function SitesPage() {
  const { data: user } = useCurrentUser();
  const { data: sitesData, isLoading } = useSites();
  const sites = sitesData?.sites ?? [];
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await logout();
    queryClient.removeQueries({ queryKey: ["user"] });
    router.replace("/login");
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Spinner size="md" />
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full p-9">
        <div className="max-w-[420px] text-center">
          <div className="w-10 h-10 rounded-full border-hairline mx-auto mb-[18px]" />
          <p className="text-[15px] font-medium text-text-body mb-2">
            your account is ready
          </p>
          <p className="text-[13px] text-[#444] leading-relaxed mb-[18px]">
            we'll prepare your site and email you when it's live. usually within
            1 business day.
          </p>
          <p className="text-[12px] text-text-muted leading-relaxed">
            in the meantime, feel free to try the demo at{" "}
            <a
              href="https://getcontextus.dev/try"
              className="underline hover:text-text-body transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              getcontextus.dev/try
            </a>
          </p>
          <div className="mt-[18px] pt-3.5 border-hairline-t font-mono text-[11px] text-text-muted">
            signed in as {user?.email} ·{" "}
            <button
              onClick={handleSignOut}
              className="hover:text-text-body transition-colors"
            >
              sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Populated state — full SiteCard implementation comes in PR 4
  return (
    <div className="p-4">
      <p className="text-[13px] font-medium text-text-body mb-4">your sites</p>
      <div className="flex flex-col gap-3">
        {sites.map((site) => (
          <div
            key={site.kb_id}
            className="border-hairline rounded-md p-3 bg-background-tertiary text-[12px] text-text-muted"
          >
            {site.name ?? site.url ?? site.kb_id}
          </div>
        ))}
      </div>
    </div>
  );
}
