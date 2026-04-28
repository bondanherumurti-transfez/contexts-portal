"use client";

import { useState } from "react";
import { useSites } from "@/lib/hooks/useSites";
import { useKB, useEnrichKB } from "@/lib/hooks/useKB";
import { QACard } from "@/components/kb/QACard";
import { GapCard } from "@/components/kb/GapCard";
import { AddQAModal } from "@/components/kb/AddQAModal";
import { Spinner } from "@/components/ui/Spinner";

export default function KnowledgePage() {
  const { data: sitesData } = useSites();
  const kb_id = sitesData?.sites[0]?.kb_id;

  const { data: kb, isLoading, isError } = useKB(kb_id);
  const enrich = useEnrichKB(kb_id ?? "");

  const [modalOpen, setModalOpen] = useState(false);
  const [prefillQuestion, setPrefillQuestion] = useState("");

  function openModal(question = "") {
    setPrefillQuestion(question);
    setModalOpen(true);
  }

  async function handleEnrich(values: { question: string; answer: string }) {
    await enrich.mutateAsync(values);
    setModalOpen(false);
  }

  if (!kb_id || isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError || !kb) {
    return (
      <div className="p-4 text-[12px] text-text-muted">
        failed to load knowledge base
      </div>
    );
  }

  const cp = kb.company_profile;
  const gaps = cp?.gaps ?? [];
  const totalWords = kb.enriched_chunks.reduce(
    (sum, c) => sum + c.word_count,
    0,
  );

  return (
    <div className="p-3.5 space-y-5 max-w-[680px]">
      {/* Profile section */}
      <section>
        <div className="mb-1">
          <div className="text-[13px] font-medium text-primary">profile</div>
        </div>
        <div className="text-[11px] text-text-muted mb-2">
          extracted from your site. recrawl to refresh after site changes.
        </div>
        {cp ? (
          <div className="space-y-0">
            {cp.name && (
              <div className="flex gap-3 py-[5px] border-hairline-b text-[12px]">
                <div className="w-[110px] shrink-0 text-text-muted">name</div>
                <div className="text-text-body">{cp.name}</div>
              </div>
            )}
            {cp.industry && (
              <div className="flex gap-3 py-[5px] border-hairline-b text-[12px]">
                <div className="w-[110px] shrink-0 text-text-muted">industry</div>
                <div className="text-text-body">{cp.industry}</div>
              </div>
            )}
            {cp.services && (
              <div className="flex gap-3 py-[5px] border-hairline-b text-[12px]">
                <div className="w-[110px] shrink-0 text-text-muted">services</div>
                <div className="text-text-body">{cp.services}</div>
              </div>
            )}
            {cp.out_of_scope && (
              <div className="flex gap-3 py-[5px] border-hairline-b text-[12px]">
                <div className="w-[110px] shrink-0 text-text-muted">out of scope</div>
                <div className="text-text-body">{cp.out_of_scope}</div>
              </div>
            )}
            {cp.summary && (
              <div className="flex gap-3 py-[5px] text-[12px]">
                <div className="w-[110px] shrink-0 text-text-muted">summary</div>
                <div className="text-text-body leading-[1.6]">{cp.summary}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-[12px] text-text-muted py-2">
            no profile yet — recrawl to generate
          </div>
        )}
      </section>

      {/* Gaps section — only renders when gaps exist */}
      {gaps.length > 0 && (
        <section>
          <div className="text-[13px] font-medium text-primary mb-1">
            gaps the AI doesn&apos;t know yet
          </div>
          <div className="text-[11px] text-text-muted mb-2">
            our crawler noticed these are missing. answering them teaches the AI.
          </div>
          <div className="space-y-1.5">
            {gaps.map((gap) => (
              <GapCard
                key={gap}
                title={gap}
                description="visitors will ask. add a Q&A so the AI can respond."
                onAnswer={() => openModal(gap)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Your added knowledge section */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <div className="text-[13px] font-medium text-primary">
            your added knowledge
          </div>
          <button
            onClick={() => openModal()}
            className="text-[11px] text-white bg-primary rounded px-2.5 py-[3px] hover:opacity-80 transition-opacity"
          >
            + add Q&amp;A
          </button>
        </div>
        <div className="text-[11px] text-text-muted mb-2">
          questions you&apos;ve answered manually. these are added to the AI&apos;s context.
        </div>
        {kb.enriched_chunks.length > 0 ? (
          <div className="space-y-1.5">
            {kb.enriched_chunks.map((chunk) => (
              <QACard
                key={chunk.id}
                question={chunk.question}
                answer={chunk.answer}
              />
            ))}
          </div>
        ) : (
          <div className="text-[12px] text-text-muted py-2">
            no Q&amp;A added yet
          </div>
        )}
        {kb.enriched_chunks.length > 0 && (
          <div className="text-[11px] text-text-muted font-mono mt-2">
            adding a Q&amp;A regenerates your AI&apos;s profile ·{" "}
            {kb.enriched_chunks.length}{" "}
            {kb.enriched_chunks.length === 1 ? "entry" : "entries"} · {totalWords} words
          </div>
        )}
      </section>

      <AddQAModal
        open={modalOpen}
        defaultQuestion={prefillQuestion}
        onClose={() => setModalOpen(false)}
        onSubmit={handleEnrich}
        submitting={enrich.isPending}
      />
    </div>
  );
}
