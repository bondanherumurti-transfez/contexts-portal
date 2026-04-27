interface QACardProps {
  /** The question text, rendered bold at 12 px. */
  question: string;
  /** The answer text, rendered in muted gray at 12 px with 1.6 line-height. */
  answer: string;
}

export function QACard({ question, answer }: QACardProps) {
  return (
    <div className="px-[14px] py-3 border-hairline rounded">
      <div className="text-[12px] text-primary mb-[5px] font-medium">{question}</div>
      <div className="text-[12px] text-[#444] leading-[1.6]">{answer}</div>
    </div>
  );
}
