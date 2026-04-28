import { InboxContent } from "./InboxContent";

// searchParams is a Promise in Next.js 15
export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session } = await searchParams;
  return <InboxContent initialSessionId={session ?? null} />;
}
