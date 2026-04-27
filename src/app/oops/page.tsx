"use client";

import { useRouter } from "next/navigation";

export default function OopsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary">
      <div className="bg-background border-hairline rounded-lg p-8 w-80 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">C</span>
          </div>
        </div>

        <p className="text-[15px] font-medium text-text-body mb-1">
          service unavailable
        </p>
        <p className="text-[12px] text-text-muted mb-6 leading-relaxed">
          we couldn't reach the server. this is on our end — please try again in a moment.
        </p>

        <button
          onClick={() => router.replace("/inbox")}
          className="w-full h-[38px] border-hairline rounded text-[13px] text-text-body hover:bg-background-secondary transition-colors"
        >
          try again
        </button>
      </div>
    </div>
  );
}
