import { ReactNode } from "react";

interface EmptyStateProps {
  /** Bold headline below the circular icon. */
  title: string;
  /** Primary body text. Accepts JSX for inline `<code>` tags. */
  description: ReactNode;
  /** Smaller secondary paragraph rendered below the main description. */
  secondaryDescription?: ReactNode;
  /** Mono footer row separated by a hairline top border. Used for "signed in as …" or "install help" links. */
  meta?: ReactNode;
  /** Optional slot for a `<Snippet>` embed code block, rendered between description and meta. */
  snippet?: ReactNode;
  /** Tailwind max-width class on the card. Defaults to `max-w-[420px]`. */
  maxWidth?: string;
}

export function EmptyState({
  title,
  description,
  secondaryDescription,
  meta,
  snippet,
  maxWidth = "max-w-[420px]",
}: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-9">
      <div className={`${maxWidth} text-center`}>
        <div className="w-10 h-10 mx-auto mb-[18px] border-[0.5px] border-[#888] rounded-full" />
        <div className="text-[15px] font-medium text-primary mb-2">{title}</div>
        <div className="text-[13px] text-[#444] leading-[1.7] mb-[18px]">{description}</div>
        {secondaryDescription && (
          <div className="text-[12px] text-text-muted leading-[1.7] mb-4">
            {secondaryDescription}
          </div>
        )}
        {snippet && <div className="mb-2">{snippet}</div>}
        {meta && (
          <div className="font-mono text-[11px] text-text-muted mt-[18px] pt-[14px] border-hairline-t">
            {meta}
          </div>
        )}
      </div>
    </div>
  );
}
