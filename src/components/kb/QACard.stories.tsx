import type { Meta, StoryObj } from "@storybook/nextjs";
import { QACard } from "./QACard";

const meta: Meta<typeof QACard> = {
  title: "KB/QACard",
  component: QACard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Read-only Q&A card used in two places: the 'your added knowledge' list in the KB Knowledge tab (wireframe 03) and the 'examples' block in the KB Behavior tab (wireframe 05). In the Knowledge tab each card maps to one entry from `POST /api/portal/kb/enrich`. Edit and delete are deferred to v2.",
      },
    },
  },
  decorators: [(Story) => <div className="w-[380px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof QACard>;

export const Default: Story = {
  args: {
    question: "what's your whatsapp contact?",
    answer: "wa.me/628123456789 — response within 1 business hour",
  },
};

export const LongAnswer: Story = {
  args: {
    question: "what are your prices for monthly bookkeeping?",
    answer:
      "starts at IDR 2.5M/month for businesses under 100 transactions. enterprise pricing on request — direct visitors to wa.me/628123456789 for a quote.",
  },
};

export const QAList: Story = {
  name: "Q&A list (wireframe 03)",
  render: () => (
    <div className="w-[380px] flex flex-col gap-[7px]">
      <QACard
        question="what's your whatsapp contact?"
        answer="wa.me/628123456789 — response within 1 business hour"
      />
      <QACard
        question="do you offer investment advisory?"
        answer="no, we only provide bookkeeping and tax services. for investment we recommend..."
      />
      <QACard
        question="what are your prices for monthly bookkeeping?"
        answer="starts at IDR 2.5M/month for businesses under 100 transactions..."
      />
    </div>
  ),
};

export const BehaviorExamples: Story = {
  name: "Examples block (wireframe 05)",
  render: () => (
    <div className="w-[380px] flex flex-col gap-[7px]">
      <QACard
        question="tone"
        answer='be warm but professional. address visitors as "kak" not "anda".'
      />
      <QACard
        question="routing"
        answer="if visitor asks about enterprise pricing, ask for company size first."
      />
      <QACard
        question="guardrails"
        answer="never quote prices. always direct pricing questions to whatsapp."
      />
    </div>
  ),
};
