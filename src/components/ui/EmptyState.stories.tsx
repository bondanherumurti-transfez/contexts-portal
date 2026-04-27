import type { Meta, StoryObj } from "@storybook/nextjs";
import { EmptyState } from "./EmptyState";
import { Snippet } from "./Snippet";

const meta: Meta<typeof EmptyState> = {
  title: "UI/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "white" },
    docs: {
      description: {
        component:
          "Centered empty-state card used across two screens: the first-time user state on `/sites` (wireframe 07) and the inbox with no conversations (wireframe 08). Always fills remaining vertical space via `flex-1`. Accepts an optional `<Snippet>` slot for the embed code and a mono `meta` footer row.",
      },
    },
  },
  decorators: [(Story) => <div className="h-screen flex flex-col"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const FirstTimeUser: Story = {
  name: "First-time user (wireframe 07)",
  args: {
    title: "your account is ready",
    description: "we'll prepare your site and email you when it's live. usually within 1 business day.",
    secondaryDescription: "in the meantime, feel free to try the demo at getcontextus.dev/try",
    meta: "signed in as new.user@example.com · sign out",
  },
};

export const InboxEmpty: Story = {
  name: "Inbox empty state (wireframe 08)",
  args: {
    maxWidth: "max-w-[480px]",
    title: "no conversations yet",
    description: (
      <>
        paste this snippet before{" "}
        <code className="font-mono text-[12px]">&lt;/body&gt;</code> on your
        site to start collecting leads.
      </>
    ),
    snippet: (
      <Snippet
        code={`<script src="https://contextus.dev/widget/floating.js"\n  data-knowledge-base-id="kb_finfloo_xxx"></script>`}
      />
    ),
    meta: "install help · view in sites tab",
  },
};
