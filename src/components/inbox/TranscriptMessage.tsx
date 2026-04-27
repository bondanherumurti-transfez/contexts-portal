import { ReactNode } from "react";

interface TranscriptMessageProps {
  /**
   * `user` — visitor bubble, right-aligned, dark background (`#111`).
   * `bot` — agent bubble, left-aligned, white with hairline border.
   */
  role: "user" | "bot";
  children: ReactNode;
}

export function TranscriptMessage({ role, children }: TranscriptMessageProps) {
  const isUser = role === "user";
  return (
    <div className={`flex mb-[6px] ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-[10px] py-[5px] rounded-[8px] text-[11px] max-w-[75%] ${
          isUser
            ? "bg-visitor-bubble text-white"
            : "bg-white text-[#444] border-hairline"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
