/** Qualification category for a lead session. Maps to backend `qualification` field. */
export type TagVariant = "qualified" | "high" | "medium" | "unclear" | "out_of_scope";

interface TagProps {
  /** Qualification level — drives color. `qualified` renders black; all others render gray. */
  variant: TagVariant;
  /** Override the displayed text. Defaults to the variant name. */
  label?: string;
}

const LABEL: Record<TagVariant, string> = {
  qualified: "qualified",
  high: "high",
  medium: "medium",
  unclear: "unclear",
  out_of_scope: "out_of_scope",
};

export function Tag({ variant, label }: TagProps) {
  const isQualified = variant === "qualified";
  return (
    <span
      className={`text-[10px] px-[7px] py-[2px] rounded-[8px] ${
        isQualified ? "bg-primary text-white" : "bg-border text-[#444]"
      }`}
    >
      {label ?? LABEL[variant]}
    </span>
  );
}
