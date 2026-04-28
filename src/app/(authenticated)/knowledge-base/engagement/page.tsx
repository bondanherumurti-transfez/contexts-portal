"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSites } from "@/lib/hooks/useSites";
import { useKB, useUpdateGreeting, useUpdatePills } from "@/lib/hooks/useKB";
import { WidgetPreview } from "@/components/kb/WidgetPreview";
import { Spinner } from "@/components/ui/Spinner";

const schema = z.object({
  greeting: z.string().max(200),
  pills: z.tuple([
    z.string().min(1).max(100),
    z.string().min(1).max(100),
    z.string().min(1).max(100),
  ]),
});

type FormValues = z.infer<typeof schema>;

function SavedIndicator({ savedAt }: { savedAt: number | null }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!savedAt) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [savedAt]);

  if (!savedAt) return null;
  const secs = Math.floor((Date.now() - savedAt) / 1000);
  const label = secs < 5 ? "just now" : `${secs}s ago`;
  return (
    <span className="font-mono text-[10px] text-text-muted">
      saved · {label}
    </span>
  );
}

export default function EngagementPage() {
  const { data: sitesData } = useSites();
  const kb_id = sitesData?.sites[0]?.kb_id;

  const { data: kb, isLoading } = useKB(kb_id);
  const updateGreeting = useUpdateGreeting(kb_id ?? "");
  const updatePills = useUpdatePills(kb_id ?? "");

  const [greetingSavedAt, setGreetingSavedAt] = useState<number | null>(null);
  const [pillsSavedAt, setPillsSavedAt] = useState<number | null>(null);
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pillsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { register, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { greeting: "", pills: ["", "", ""] },
  });

  // Seed form when KB data loads
  useEffect(() => {
    if (!kb) return;
    reset({
      greeting: kb.greeting ?? "",
      pills: (kb.pills.length === 3
        ? kb.pills
        : ["", "", ""]) as [string, string, string],
    });
  }, [kb, reset]);

  const pillsValues = watch("pills");
  const greetingValue = watch("greeting");
  const previewPills =
    pillsValues.every((p) => p.trim().length > 0)
      ? (pillsValues as [string, string, string])
      : null;

  function handleGreetingBlur(value: string) {
    if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
    greetingTimerRef.current = setTimeout(async () => {
      try {
        await updateGreeting.mutateAsync(value.trim() || null);
        setGreetingSavedAt(Date.now());
      } catch {}
    }, 500);
  }

  function handlePillsBlur() {
    if (pillsTimerRef.current) clearTimeout(pillsTimerRef.current);
    pillsTimerRef.current = setTimeout(async () => {
      const current = pillsValues;
      if (current.some((p) => !p.trim())) return;
      try {
        await updatePills.mutateAsync(current.map((p) => p.trim()));
        setPillsSavedAt(Date.now());
      } catch {}
    }, 500);
  }

  if (!kb_id || isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="p-3.5 space-y-5 max-w-[680px]">
      {/* Greeting section */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <div className="text-[13px] font-medium text-primary">
            greeting message
          </div>
          <SavedIndicator savedAt={greetingSavedAt} />
        </div>
        <div className="text-[11px] text-text-muted mb-2">
          first thing visitors see. keep it short and conversational.
        </div>
        <div className="mb-1">
          <div className="text-[11px] text-text-muted mb-1 font-mono tracking-[0.5px]">
            message
          </div>
          <textarea
            {...register("greeting")}
            rows={3}
            onBlur={(e) => handleGreetingBlur(e.target.value)}
            className="w-full bg-background-secondary rounded px-3 py-[8px] text-[12px] text-[#444] leading-[1.6] outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="halo, ada yang bisa kami bantu?"
          />
          {errors.greeting && (
            <div className="text-[11px] text-error-text mt-0.5">
              {errors.greeting.message}
            </div>
          )}
        </div>
        <div className="text-right font-mono text-[10px] text-text-muted">
          {greetingValue.length} / 200
        </div>
      </section>

      {/* Pills section */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <div className="text-[13px] font-medium text-primary">
            quick reply pills
          </div>
          <SavedIndicator savedAt={pillsSavedAt} />
        </div>
        <div className="text-[11px] text-text-muted mb-2">
          3 buttons that appear above the chat. tap to send instantly.
        </div>
        <div className="space-y-1.5">
          {([0, 1, 2] as const).map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="font-mono text-[11px] text-text-muted w-5 shrink-0">
                0{i + 1}
              </div>
              <input
                {...register(`pills.${i}`)}
                onBlur={handlePillsBlur}
                className="flex-1 h-[30px] bg-background-secondary rounded px-3 text-[12px] text-[#444] outline-none focus:ring-1 focus:ring-primary"
                placeholder={`pill ${i + 1}`}
              />
            </div>
          ))}
        </div>
        {errors.pills && (
          <div className="text-[11px] text-error-text mt-1">
            all 3 pills must be non-empty
          </div>
        )}
      </section>

      {/* Preview section */}
      <section>
        <div className="text-[13px] font-medium text-primary mb-1">preview</div>
        <div className="text-[11px] text-text-muted mb-2">
          how this looks on your site.
        </div>
        {previewPills ? (
          <WidgetPreview pills={previewPills} />
        ) : (
          <div className="text-[12px] text-text-muted py-2">
            fill in all 3 pills to see preview
          </div>
        )}
      </section>
    </div>
  );
}
