import type { Meta, StoryObj } from "@storybook/nextjs";
import { KeyValue } from "./KeyValue";

const meta: Meta<typeof KeyValue> = {
  title: "UI/KeyValue",
  component: KeyValue,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Labeled row used in the Knowledge Base profile section (wireframe 03). The key column is fixed at 90 px in DM Mono; the value column fills remaining space with `flex-1`. Each row has a hairline bottom border. Compose multiples to build a profile table — no wrapping container needed.",
      },
    },
  },
  decorators: [(Story) => <div className="w-[400px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof KeyValue>;

export const Default: Story = {
  args: { label: "name", value: "finfloo" },
};

export const LongValue: Story = {
  name: "Long value (multiline)",
  args: {
    label: "summary",
    value:
      "indonesian SMB bookkeeping firm offering monthly recording, tax filing (PPh & PPN), and payroll for businesses with 1–100 employees...",
  },
};

export const KBProfile: Story = {
  name: "KB profile block",
  render: () => (
    <div className="w-full">
      <KeyValue label="name" value="finfloo" />
      <KeyValue label="industry" value="bookkeeping & tax services" />
      <KeyValue label="services" value="monthly bookkeeping · tax filing · payroll · audit" />
      <KeyValue label="out of scope" value="investment advisory · legal advice" />
      <KeyValue
        label="summary"
        value="indonesian SMB bookkeeping firm offering monthly recording, tax filing (PPh & PPN), and payroll for businesses with 1–100 employees..."
      />
    </div>
  ),
};
