"use client";

import { usePathname } from "next/navigation";
import type { Site } from "@/lib/api/types";

interface TopbarProps {
  sites: Site[];
}

export function Topbar({ sites }: TopbarProps) {
  const pathname = usePathname();

  const isOnSites = pathname === "/sites";
  const siteLabel = isOnSites
    ? "your sites"
    : (sites[0]?.url ?? sites[0]?.name ?? "your sites");

  return (
    <div className="h-[38px] px-3.5 flex items-center border-hairline-b text-[12px] text-[#444] shrink-0">
      <span>{siteLabel}</span>
    </div>
  );
}
