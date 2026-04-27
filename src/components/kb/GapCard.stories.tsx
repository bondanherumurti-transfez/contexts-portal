import type { Meta, StoryObj } from "@storybook/nextjs";
import { GapCard } from "./GapCard";

const meta: Meta<typeof GapCard> = {
  title: "KB/GapCard",
  component: GapCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Knowledge gap card in the KB Knowledge tab (wireframe 03). Gaps are detected by the crawler and surfaced by the backend in `kb.gaps`. Each card has a '+ answer this' CTA that opens `AddQAModal` with the gap title pre-filled as the question. The entire gaps section is hidden when `kb.gaps` is empty.",
      },
    },
  },
  decorators: [(Story) => <div className="w-[380px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof GapCard>;

export const Default: Story = {
  args: {
    title: "no pricing page found",
    description: "visitors will ask. add a Q&A so the AI can respond.",
  },
};

export const ContactGap: Story = {
  args: {
    title: "no contact details for support",
    description: "whatsapp number, response time, hours.",
  },
};

export const TwoGaps: Story = {
  name: "Gaps section (wireframe 03)",
  render: () => (
    <div className="w-[380px]">
      <GapCard
        title="no pricing page found"
        description="visitors will ask. add a Q&A so the AI can respond."
      />
      <GapCard
        title="no contact details for support"
        description="whatsapp number, response time, hours."
      />
    </div>
  ),
};
