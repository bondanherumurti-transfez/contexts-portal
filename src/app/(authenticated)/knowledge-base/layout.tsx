"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "knowledge", href: "/knowledge-base/knowledge" },
  { label: "engagement", href: "/knowledge-base/engagement" },
  { label: "behavior", href: "/knowledge-base/behavior" },
] as const;

export default function KnowledgeBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-0.5 px-2 sm:px-3.5 border-hairline-b shrink-0 pt-1">
        {TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`px-2 sm:px-3 py-[7px] text-[12px] border-b-[1.5px] -mb-px transition-colors ${
              pathname === tab.href
                ? "text-text-body border-text-body"
                : "text-text-muted border-transparent hover:text-text-body"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
