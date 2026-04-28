"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessions } from "@/lib/hooks/useSessions";
import { useSession } from "@/lib/hooks/useSession";
import { useSites } from "@/lib/hooks/useSites";
import { SessionListItem } from "@/components/inbox/SessionListItem";
import { BriefPanel } from "@/components/inbox/BriefPanel";
import { NoBriefPanel } from "@/components/inbox/NoBriefPanel";
import { TranscriptMessage } from "@/components/inbox/TranscriptMessage";
import { Snippet } from "@/components/ui/Snippet";
import { Spinner } from "@/components/ui/Spinner";
import { TagVariant } from "@/components/ui/Tag";
import { relativeTime } from "@/lib/utils";
import {
  SessionListItem as SessionListItemType,
  LeadBrief,
  Message,
} from "@/lib/api/types";

function tagsForSession(item: SessionListItemType): TagVariant[] {
  const tags: TagVariant[] = [];
  if (item.qualification === "qualified") tags.push("qualified");
  else if (item.qualification === "out_of_scope") tags.push("out_of_scope");
  else if (item.qualification === "unclear") tags.push("unclear");
  if (item.quality_score === "high") tags.push("high");
  else if (item.quality_score === "medium") tags.push("medium");
  return tags;
}

// Backend stores contact as a JSON object string: {"email": null, "phone": "08xxx", "whatsapp": null}
// Extract the first non-null string value.
function extractContactValue(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      for (const val of Object.values(parsed)) {
        if (val && typeof val === "string") return val;
      }
      return null;
    }
  } catch {
    // not JSON — use as-is
  }
  return raw;
}

function sessionName(item: SessionListItemType): string {
  if (item.qualification === "suspicious") return "— spam —";
  const contact = extractContactValue(item.contact_value);
  if (contact) return contact;
  return "anonymous";
}

function briefToRows(brief: LeadBrief) {
  const rows = [
    { key: "who", value: brief.who },
    { key: "need", value: brief.need },
    { key: "signals", value: brief.signals },
    { key: "score", value: `${brief.quality_score ?? "—"} · ${brief.qualification ?? "—"}` },
  ];
  if (brief.contact) {
    const contactVal = Object.entries(brief.contact)
      .filter(([, v]) => v && typeof v === "string")
      .map(([, v]) => v as string)
      .join(" · ");
    if (contactVal) rows.splice(3, 0, { key: "contact", value: contactVal });
  }
  return rows;
}

function messageRole(msg: Message): "user" | "bot" {
  const r = msg.role;
  if (r === "user") return "user";
  return "bot";
}

function messageText(msg: Message): string {
  return msg.text ?? msg.content ?? "";
}

function formatSessionDate(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InboxContent({ initialSessionId }: { initialSessionId: string | null }) {
  const router = useRouter();
  // Local state avoids useSearchParams() and the Suspense unmount-on-navigate bug.
  // initialSessionId comes from the RSC page (searchParams prop) for direct URL visits.
  const [selectedId, setSelectedId] = useState<string | null>(initialSessionId);
  const [search, setSearch] = useState("");

  const { data: sitesData } = useSites();
  const site = sitesData?.sites[0];
  const kb_id = site?.kb_id;

  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSessions(kb_id);
  const sessions = sessionsData?.pages.flatMap((p) => p.sessions) ?? [];
  const filtered = search
    ? sessions.filter((s) => {
        const q = search.toLowerCase();
        return (
          sessionName(s).toLowerCase().includes(q) ||
          (s.preview ?? "").toLowerCase().includes(q)
        );
      })
    : sessions;

  const { data: sessionDetail, isLoading: detailLoading } = useSession(selectedId);

  function selectSession(session_id: string) {
    setSelectedId(session_id);
    router.push(`/inbox?session=${session_id}`);
  }

  if (!kb_id || sessionsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Spinner size="md" />
      </div>
    );
  }

  // State B — empty inbox
  if (sessions.length === 0 && kb_id) {
    const snippet = `<script src="https://contextus.dev/widget/floating.js" data-knowledge-base-id="${kb_id}"></script>`;
    return (
      <div className="flex-1 flex items-center justify-center h-full p-9">
        <div className="max-w-[480px] w-full text-center">
          <div className="w-10 h-10 rounded-full border-hairline mx-auto mb-[18px]" />
          <p className="text-[15px] font-medium text-text-body mb-2">no conversations yet</p>
          <p className="text-[13px] text-[#444] leading-relaxed mb-[18px]">
            paste this snippet before{" "}
            <code className="font-mono text-[12px]">&lt;/body&gt;</code> on your site to
            start collecting leads.
          </p>
          <Snippet code={snippet} />
          <p className="mt-3 text-[11px] text-text-muted font-mono">
            <a href="#" className="underline hover:text-text-body transition-colors">
              install help
            </a>
            {" · "}
            <a
              href="/sites"
              className="underline hover:text-text-body transition-colors"
            >
              view in sites tab
            </a>
          </p>
        </div>
      </div>
    );
  }

  // States A & C — split pane
  return (
    <div className="flex-1 flex overflow-hidden min-h-0">
      {/* Left pane — session list; hidden on mobile when a session is open */}
      <div className={`sm:w-[240px] sm:shrink-0 sm:flex flex-col border-hairline-r min-h-0 ${selectedId ? "hidden" : "flex w-full"}`}>
        <div className="px-[14px] py-[10px] border-hairline-b shrink-0">
          <div className="flex items-center gap-2 px-[8px] py-[5px] border-hairline rounded text-[11px] bg-background-secondary">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="shrink-0">
              <circle cx="4.5" cy="4.5" r="3.5" stroke="#BBB" />
              <path d="M7.5 7.5L10 10" stroke="#BBB" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[11px] text-text-body placeholder:text-text-placeholder min-w-0"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {filtered.map((s) => (
            <SessionListItem
              key={s.session_id}
              name={sessionName(s)}
              time={relativeTime(s.updated_at)}
              preview={s.preview}
              tags={tagsForSession(s)}
              active={selectedId === s.session_id}
              onClick={() => selectSession(s.session_id)}
            />
          ))}
          {filtered.length === 0 && search && (
            <p className="px-[14px] py-[10px] text-[11px] text-text-muted">no results</p>
          )}
          {hasNextPage && !search && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-[14px] py-[10px] text-[11px] text-text-muted hover:text-text-body transition-colors border-hairline-t text-center w-full disabled:opacity-50"
            >
              {isFetchingNextPage ? "loading…" : "load older"}
            </button>
          )}
        </div>
      </div>

      {/* Right pane — session detail; shown on mobile only when a session is selected */}
      <div className={`sm:flex sm:flex-col flex-1 overflow-y-auto p-[16px] ${selectedId ? "flex flex-col" : "hidden"}`}>
        <button
          onClick={() => { setSelectedId(null); router.push("/inbox"); }}
          className="sm:hidden text-left text-[11px] text-text-muted hover:text-text-body mb-3 shrink-0"
        >
          ← back
        </button>
        {!selectedId && (
          <div className="h-full flex items-center justify-center">
            <p className="text-[12px] text-text-muted">select a conversation</p>
          </div>
        )}

        {selectedId && detailLoading && (
          <div className="h-full flex items-center justify-center">
            <Spinner size="sm" />
          </div>
        )}

        {selectedId && !detailLoading && sessionDetail?.brief && (
          <BriefPanel
            rows={briefToRows(sessionDetail.brief)}
            messages={(sessionDetail.session.messages ?? []).map((m) => ({
              role: messageRole(m),
              text: messageText(m),
            }))}
          />
        )}

        {selectedId && !detailLoading && sessionDetail && !sessionDetail.brief && (() => {
          const { session } = sessionDetail;
          const messages = session.messages ?? [];
          return (
            <div>
              <div className="text-[11px] text-text-muted tracking-[1px] uppercase mb-2 font-mono">
                conversation
              </div>
              <div className="flex flex-col gap-[6px] mb-3">
                <div className="flex gap-[10px] text-[12px] py-1">
                  <div className="w-[70px] text-text-muted text-[11px] shrink-0">started</div>
                  <div className="text-[#444]">
                    {formatSessionDate(session.created_at)} · {session.message_count} messages
                  </div>
                </div>
                <div className="flex gap-[10px] text-[12px] py-1">
                  <div className="w-[70px] text-text-muted text-[11px] shrink-0">contact</div>
                  <div className={extractContactValue(session.contact_value) ? "text-[#444]" : "text-text-muted"}>
                    {extractContactValue(session.contact_value) ?? "not captured"}
                  </div>
                </div>
                <div className="flex gap-[10px] text-[12px] py-1">
                  <div className="w-[70px] text-text-muted text-[11px] shrink-0">status</div>
                  <div className="text-[#444]">
                    {session.brief_sent ? "brief generated" : "unclear · no brief generated"}
                  </div>
                </div>
              </div>
              <NoBriefPanel />
              <div className="bg-background-secondary rounded p-[10px] max-h-[320px] overflow-y-auto mt-3">
                {messages.map((msg, i) => (
                  <TranscriptMessage key={i} role={messageRole(msg)}>
                    {messageText(msg)}
                  </TranscriptMessage>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
