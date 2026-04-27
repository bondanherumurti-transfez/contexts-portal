import { Tag, TagVariant } from "@/components/ui/Tag";

interface SessionListItemProps {
  /** Visitor display name, or `"anonymous"` / `"— spam —"` for unidentified sessions. */
  name: string;
  /** Human-readable relative time, e.g. `"2h"`, `"1d"`. */
  time: string;
  /** One-line preview text from the session brief or first message. */
  preview: string;
  /** Qualification tags to render below the preview. Usually qualification + score. */
  tags: TagVariant[];
  /** Highlights the row as the currently selected session. */
  active?: boolean;
  onClick?: () => void;
}

export function SessionListItem({
  name,
  time,
  preview,
  tags,
  active = false,
  onClick,
}: SessionListItemProps) {
  return (
    <div
      className={`px-[14px] py-[11px] border-hairline-b flex flex-col gap-[5px] cursor-pointer select-none ${
        active ? "bg-background-secondary" : "hover:bg-background-secondary/60"
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center text-[12px]">
        <span className="font-medium text-primary">{name}</span>
        <span className="text-text-muted text-[11px]">{time}</span>
      </div>
      <div className="text-[11px] text-text-muted">{preview}</div>
      <div className="flex gap-[5px]">
        {tags.map((t) => (
          <Tag key={t} variant={t} />
        ))}
      </div>
    </div>
  );
}
