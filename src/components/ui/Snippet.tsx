"use client";

import { useState } from "react";

interface SnippetProps {
  /** Raw code string to display and copy. Whitespace and newlines are preserved. */
  code: string;
  /** Extra Tailwind classes on the outer wrapper. */
  className?: string;
}

export function Snippet({ code, className = "" }: SnippetProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`relative group ${className}`}>
      <pre className="bg-background-secondary rounded px-[14px] py-3 font-mono text-[11px] text-[#444] leading-[1.7] break-all whitespace-pre-wrap">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 font-mono text-[10px] text-text-muted bg-background-secondary border-[0.5px] border-[#888] rounded opacity-0 group-hover:opacity-100 hover:text-text-body transition-opacity"
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
