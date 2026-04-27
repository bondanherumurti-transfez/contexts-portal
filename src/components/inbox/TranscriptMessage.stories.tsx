import type { Meta, StoryObj } from "@storybook/nextjs";
import { TranscriptMessage } from "./TranscriptMessage";

const meta: Meta<typeof TranscriptMessage> = {
  title: "Inbox/TranscriptMessage",
  component: TranscriptMessage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Single chat bubble in the transcript viewer. `user` (visitor) bubbles are right-aligned with a dark `#111` background. `bot` (agent) bubbles are left-aligned, white with a hairline border. The parent transcript container handles scrolling — this component is purely presentational.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] bg-background-secondary rounded p-[10px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TranscriptMessage>;

export const UserMessage: Story = {
  args: { role: "user", children: "do you handle restaurants?" },
};

export const BotMessage: Story = {
  args: { role: "bot", children: "yes, several F&B businesses use our services." },
};

export const ConversationThread: Story = {
  name: "Conversation thread",
  render: () => (
    <div className="w-[360px] bg-background-secondary rounded p-[10px]">
      <TranscriptMessage role="user">do you handle restaurants?</TranscriptMessage>
      <TranscriptMessage role="bot">yes, several F&B businesses...</TranscriptMessage>
      <TranscriptMessage role="user">we have 3 outlets...</TranscriptMessage>
      <TranscriptMessage role="bot">got it. for 3 outlets we typically...</TranscriptMessage>
    </div>
  ),
};
