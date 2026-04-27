"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  question: z.string().min(1).max(200),
  answer: z.string().min(1).max(2000),
});

type FormValues = z.infer<typeof schema>;

interface AddQAModalProps {
  /** Controls visibility. When `false` the modal is not mounted. */
  open: boolean;
  /**
   * Pre-fills the question field. Pass the gap title when triggered from a `GapCard`'s
   * "+ answer this" button; leave empty for a blank "+ add Q&A" flow.
   */
  defaultQuestion?: string;
  /** Called when the user clicks cancel or clicks outside the modal. */
  onClose: () => void;
  /** Called with validated form values on submit. Can be async; modal shows "adding…" while pending. */
  onSubmit: (values: FormValues) => void | Promise<void>;
  /** Disables the submit button and shows "adding…" label while the mutation is in-flight. */
  submitting?: boolean;
}

export function AddQAModal({
  open,
  defaultQuestion = "",
  onClose,
  onSubmit,
  submitting = false,
}: AddQAModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { question: defaultQuestion, answer: "" },
  });

  useEffect(() => {
    if (open) reset({ question: defaultQuestion, answer: "" });
  }, [open, defaultQuestion, reset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[12px] p-6 w-[420px] border-hairline shadow-lg">
        <div className="text-[14px] font-medium mb-[5px] text-primary">
          add a question &amp; answer
        </div>
        <div className="text-[12px] text-text-muted mb-[18px] leading-[1.6]">
          teach the AI something visitors might ask. this becomes part of the
          AI's knowledge.
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-[10px]">
            <div className="text-[11px] text-text-muted mb-1 font-mono tracking-[0.5px]">
              question
            </div>
            <input
              {...register("question")}
              className="w-full h-[30px] bg-background-secondary rounded px-3 text-[12px] text-[#444] outline-none focus:ring-1 focus:ring-primary"
              placeholder="what are your prices for monthly bookkeeping?"
            />
            {errors.question && (
              <div className="text-[11px] text-error-text mt-1">
                {errors.question.message}
              </div>
            )}
          </div>

          <div className="mb-[14px]">
            <div className="text-[11px] text-text-muted mb-1 font-mono tracking-[0.5px]">
              answer
            </div>
            <textarea
              {...register("answer")}
              rows={4}
              className="w-full bg-background-secondary rounded px-3 py-[10px] text-[12px] text-[#444] leading-[1.6] outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="starts at IDR 2.5M/month for businesses under 100 transactions..."
            />
            {errors.answer && (
              <div className="text-[11px] text-error-text mt-1">
                {errors.answer.message}
              </div>
            )}
          </div>

          <div className="text-[11px] text-[#444] px-3 py-[10px] bg-background-secondary rounded mb-2 leading-[1.6]">
            adding this regenerates your AI's company profile from all
            knowledge. takes ~10 seconds.
          </div>

          <div className="flex justify-end gap-[10px] mt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              cancel
            </Button>
            <Button type="submit" variant="solid" disabled={submitting}>
              {submitting ? "adding…" : "add to knowledge"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
