interface GapCardProps {
  /** Short headline identifying the missing knowledge, e.g. `"no pricing page found"`. */
  title: string;
  /** One-line elaboration shown below the title. */
  description: string;
  /** Called when the user clicks "+ answer this". Typically opens `AddQAModal` with the question pre-filled. */
  onAnswer?: () => void;
}

export function GapCard({ title, description, onAnswer }: GapCardProps) {
  return (
    <div className="px-[14px] py-3 bg-background-secondary rounded mb-[7px]">
      <div className="text-[12px] text-primary mb-[5px] font-medium">{title}</div>
      <div className="text-[11px] text-text-muted mb-[9px]">{description}</div>
      <button
        onClick={onAnswer}
        className="text-[11px] text-[#444] font-mono hover:underline"
      >
        + answer this
      </button>
    </div>
  );
}
