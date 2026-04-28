"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSites } from "@/lib/hooks/useSites";
import { useKB, useUpdateCustomInstructions } from "@/lib/hooks/useKB";
import { Spinner } from "@/components/ui/Spinner";

const schema = z.object({
  custom_instructions: z.string().max(2000),
});

type FormValues = z.infer<typeof schema>;

const EXAMPLES = [
  {
    key: "tone",
    value: 'be warm but professional. address visitors as "kak" not "anda".',
  },
  {
    key: "routing",
    value: "if visitor asks about enterprise pricing, ask for company size first.",
  },
  {
    key: "guardrails",
    value: "never quote prices. always direct pricing questions to whatsapp.",
  },
];

export default function BehaviorPage() {
  const { data: sitesData } = useSites();
  const kb_id = sitesData?.sites[0]?.kb_id;

  const { data: kb, isLoading } = useKB(kb_id);
  const updateCustomInstructions = useUpdateCustomInstructions(kb_id ?? "");

  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [, tick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { register, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { custom_instructions: "" },
  });

  useEffect(() => {
    if (!kb) return;
    reset({ custom_instructions: kb.custom_instructions ?? "" });
  }, [kb, reset]);

  useEffect(() => {
    if (!savedAt) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [savedAt]);

  const value = watch("custom_instructions");
  const isEmpty = !value?.trim();

  function handleBlur(raw: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await updateCustomInstructions.mutateAsync(raw.trim() || null);
        setSavedAt(Date.now());
      } catch {}
    }, 500);
  }

  async function handleReset() {
    reset({ custom_instructions: "" });
    try {
      await updateCustomInstructions.mutateAsync(null);
      setSavedAt(Date.now());
    } catch {}
  }

  const savedLabel = savedAt
    ? (() => {
        const secs = Math.floor((Date.now() - savedAt) / 1000);
        return secs < 5 ? "just now" : `${secs}s ago`;
      })()
    : null;

  if (!kb_id || isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="p-3.5 space-y-5 max-w-[680px]">
      {/* Custom instructions section */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <div className="text-[13px] font-medium text-primary">
            custom instructions
          </div>
          <div className="flex items-center gap-3">
            {savedLabel && (
              <span className="font-mono text-[10px] text-text-muted">
                saved · {savedLabel}
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-text-muted border-hairline rounded px-2.5 py-[3px] hover:text-text-body transition-colors"
            >
              reset to default
            </button>
          </div>
        </div>
        <div className="text-[11px] text-text-muted mb-2">
          tell the AI how to behave. these add to the default agent — they
          don&apos;t replace it.
        </div>
        <textarea
          {...register("custom_instructions")}
          rows={6}
          onBlur={(e) => handleBlur(e.target.value)}
          className="w-full bg-background-secondary rounded px-3 py-[8px] text-[12px] text-[#444] leading-[1.6] outline-none focus:ring-1 focus:ring-primary resize-none"
          placeholder="always respond in indonesian (bahasa). when visitor mentions urgency around tax deadlines, surface our priority service."
        />
        {errors.custom_instructions && (
          <div className="text-[11px] text-error-text mt-0.5">
            {errors.custom_instructions.message}
          </div>
        )}
        <div className="text-right font-mono text-[10px] text-text-muted mt-[3px]">
          {value.length} / 2000
        </div>
      </section>

      {/* Examples section — only when textarea is empty */}
      {isEmpty && (
        <section>
          <div className="text-[13px] font-medium text-primary mb-1">
            examples
          </div>
          <div className="text-[11px] text-text-muted mb-2">
            short directives work better than long paragraphs.
          </div>
          <div className="space-y-1.5">
            {EXAMPLES.map((ex) => (
              <div key={ex.key} className="px-[14px] py-3 border-hairline rounded">
                <div className="text-[12px] text-primary mb-[5px] font-medium">
                  {ex.key}
                </div>
                <div className="text-[12px] text-[#444] leading-[1.6]">
                  {ex.value}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Warning box */}
      <div className="px-3 py-2.5 bg-warning-bg rounded text-[11px] text-warning-text leading-[1.6]">
        these layer on top of the contextus engagement model. we tune the base
        agent every few weeks to improve qualification — your instructions stay
        yours.
      </div>
    </div>
  );
}
