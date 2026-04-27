export function NoBriefPanel() {
  return (
    <div className="px-[16px] py-[14px] bg-background-secondary rounded mt-3 text-center">
      <div className="text-[12px] text-[#444] mb-1 font-medium">
        no lead brief for this conversation
      </div>
      <div className="text-[11px] text-text-muted leading-[1.6]">
        visitor didn't share enough signals to qualify, or left before completing
        the chat. transcript still saved below.
      </div>
    </div>
  );
}
