import { Snippet } from "@/components/ui/Snippet";

interface SiteCardProps {
  /** Site display name from `Site.name`. */
  name: string;
  /** Public URL, e.g. `"finfloo.com"`. Null for sites still being configured. */
  url: string | null;
  /** Number of pages the crawler has indexed. Null means crawl is pending. */
  pagesIndexed: number | null;
  /** Knowledge-base ID used in the embed snippet (`data-knowledge-base-id`). */
  kbId: string;
  /** When true, renders the button as "activate" and dims the snippet to indicate it isn't live yet. */
  pending?: boolean;
  onManage?: () => void;
}

export function SiteCard({
  name,
  url,
  pagesIndexed,
  kbId,
  pending = false,
  onManage,
}: SiteCardProps) {
  const snippet = `<script src="https://contextus.dev/widget/floating.js" data-knowledge-base-id="${kbId}"></script>`;

  const meta = url
    ? `${url}${pagesIndexed != null ? ` · ${pagesIndexed} pages indexed` : " · pending"}`
    : "pending";

  return (
    <div className="border-hairline rounded-[8px] p-[14px] mb-3">
      <div className="flex justify-between items-center mb-3 gap-[14px]">
        <div>
          <div className="text-[13px] font-medium text-primary">{name}</div>
          <div className="text-[11px] text-text-muted mt-[3px]">{meta}</div>
        </div>
        <button
          onClick={onManage}
          className="px-3 py-[6px] border-[0.5px] border-[#888] rounded text-[11px] text-[#444] shrink-0 hover:bg-background-secondary transition-colors"
        >
          {pending ? "activate" : "manage"}
        </button>
      </div>
      <div className={pending ? "opacity-50" : ""}>
        <Snippet code={pending ? `<script src="https://contextus.dev/widget/floating.js" data-knowledge-base-id="—"></script>` : snippet} />
      </div>
    </div>
  );
}
