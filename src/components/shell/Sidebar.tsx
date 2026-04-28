"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/api/auth";

const NAV = [
  { label: "inbox", href: "/inbox" },
  { label: "knowledge base", href: "/knowledge-base" },
  { label: "analytics", href: null },
  { label: "sites", href: "/sites" },
] as const;

interface SidebarProps {
  hasSites: boolean;
}

export function Sidebar({ hasSites }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    setMenuOpen(false);
    await logout();
    queryClient.removeQueries({ queryKey: ["user"] });
    router.replace("/login");
  }

  function isActive(href: string | null): boolean {
    if (!href) return false;
    if (href === "/knowledge-base") return pathname.startsWith("/knowledge-base");
    return pathname.startsWith(href);
  }

  function isDisabled(href: string | null): boolean {
    if (href === null) return true;
    if (!hasSites && href !== "/sites") return true;
    return false;
  }

  const initials = user?.display_name
    ? user.display_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? "?");

  const displayName =
    user?.display_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";

  return (
    <div className="w-[120px] sm:w-[150px] shrink-0 flex flex-col h-full bg-background-secondary border-hairline-r">
      <div className="flex flex-col flex-1 gap-4 px-3 py-3.5">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2.5">
          <div className="w-[18px] h-[18px] rounded bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-[10px] leading-none">C</span>
          </div>
          <span className="text-[13px] font-medium tracking-[-0.3px] text-text-body">
            contextus
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV.map((item) => {
            const disabled = isDisabled(item.href);
            const active = isActive(item.href);

            if (disabled) {
              return (
                <div
                  key={item.label}
                  className="px-2.5 py-1.5 text-[12px] rounded text-text-muted opacity-50 select-none cursor-default"
                >
                  {item.label}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href!}
                className={`px-2.5 py-1.5 text-[12px] rounded transition-colors ${
                  active
                    ? "bg-background text-text-body"
                    : "text-[#444] hover:bg-background/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-full flex items-center gap-2 text-[12px] text-text-muted hover:text-text-body transition-colors"
          >
            <div className="w-[22px] h-[22px] rounded-full bg-border flex items-center justify-center shrink-0 text-[9px] font-medium text-text-body">
              {initials}
            </div>
            <span className="truncate flex-1 text-left">{displayName}</span>
            <ChevronDown className="w-3 h-3 shrink-0" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute bottom-full mb-1.5 left-0 z-20 bg-background border-hairline rounded shadow-sm w-full min-w-[110px]">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-[12px] text-text-body hover:bg-background-secondary transition-colors rounded"
                >
                  sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
