"use client";

import { usePathname } from "next/navigation";
import type { Site } from "@/lib/api/types";

interface TopbarProps {
  sites: Site[];
}

function formatCrawledDate(ts: number | null): string {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Topbar({ sites }: TopbarProps) {
  const pathname = usePathname();

  const isOnSites = pathname === "/sites";
  const isOnKB = pathname.startsWith("/knowledge-base");

  const siteLabel = isOnSites
    ? "your sites"
    : (sites[0]?.url ?? sites[0]?.name ?? "your sites");

  const site = sites[0];
  const kbMeta =
    isOnKB && site
      ? [
          site.last_crawled_at
            ? `last crawled ${formatCrawledDate(site.last_crawled_at)}`
            : null,
          site.pages_indexed != null ? `${site.pages_indexed} pages` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <div className="h-[38px] px-3.5 flex items-center justify-between border-hairline-b text-[12px] text-[#444] shrink-0">
      <span>{siteLabel}</span>
      {kbMeta && (
        <span className="font-mono text-[11px] text-text-muted">{kbMeta}</span>
      )}
    </div>
  );
}
