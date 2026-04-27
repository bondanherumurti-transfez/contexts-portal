import { ReactNode } from "react";

interface KeyValueProps {
  /** Mono label in the left column (90 px wide). */
  label: string;
  /** Value content in the right column. Accepts JSX for rich text. */
  value: ReactNode;
}

export function KeyValue({ label, value }: KeyValueProps) {
  return (
    <div className="flex gap-[14px] py-[7px] border-hairline-b text-[12px]">
      <div className="w-[90px] text-text-muted text-[11px] shrink-0 font-mono">{label}</div>
      <div className="text-[#444] flex-1 leading-[1.6]">{value}</div>
    </div>
  );
}
