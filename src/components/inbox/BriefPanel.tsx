import { TranscriptMessage } from "./TranscriptMessage";

interface BriefRow {
  /** Left-column mono label, e.g. `"who"`, `"need"`, `"score"`. */
  key: string;
  /** Right-column value text. */
  value: string;
  /** Render value in muted gray instead of default dark — used for "not captured". */
  muted?: boolean;
}

interface Message {
  role: "user" | "bot";
  text: string;
}

interface BriefPanelProps {
  /** Structured brief rows from `GET /api/portal/sessions/{id}`. */
  rows: BriefRow[];
  /** Full message history. The container is capped at 200 px and scrolls. */
  messages: Message[];
}

export function BriefPanel({ rows, messages }: BriefPanelProps) {
  return (
    <div>
      <div className="text-[11px] text-text-muted tracking-[1px] uppercase mb-2 font-mono">
        brief
      </div>
      {rows.map((row) => (
        <div key={row.key} className="flex gap-[10px] text-[12px] py-1">
          <div className="w-[70px] text-text-muted text-[11px] shrink-0">{row.key}</div>
          <div className={row.muted ? "text-text-muted" : "text-[#444]"}>{row.value}</div>
        </div>
      ))}
      <div className="bg-background-secondary rounded p-[10px] max-h-[200px] overflow-y-auto mt-3">
        {messages.map((msg, i) => (
          <TranscriptMessage key={i} role={msg.role}>
            {msg.text}
          </TranscriptMessage>
        ))}
      </div>
    </div>
  );
}
