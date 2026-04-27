import { Suspense } from "react";
import { InboxContent } from "./InboxContent";
import { Spinner } from "@/components/ui/Spinner";

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center h-full">
          <Spinner size="md" />
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  );
}
