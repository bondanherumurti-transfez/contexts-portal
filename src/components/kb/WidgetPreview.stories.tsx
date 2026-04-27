import type { Meta, StoryObj } from "@storybook/nextjs";
import { WidgetPreview } from "./WidgetPreview";

const meta: Meta<typeof WidgetPreview> = {
  title: "KB/WidgetPreview",
  component: WidgetPreview,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Live preview of the widget FAB and quick-reply pills as they appear on a visitor's screen (KB Engagement tab, wireframe 04). Shows three pill bubbles stacked above a black circle FAB. Pills are right-aligned to mirror the floating widget layout. Updated in real-time as the user edits the pills fields — drive with the current form values.",
      },
    },
  },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof WidgetPreview>;

export const Default: Story = {
  name: "Widget preview (wireframe 04)",
  args: {
    pills: [
      "layanan apa yang ditawarkan?",
      "berapa biayanya?",
      "bagaimana cara mulai?",
    ],
  },
};

export const EnglishPills: Story = {
  name: "English pills",
  args: {
    pills: ["what services do you offer?", "how much does it cost?", "how do I get started?"],
  },
};
