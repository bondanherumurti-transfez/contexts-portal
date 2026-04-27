import type { Meta, StoryObj } from "@storybook/nextjs";
import { Tag } from "./Tag";

const meta: Meta<typeof Tag> = {
  title: "UI/Tag",
  component: Tag,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Qualification chip used in the inbox session list and brief panel. `qualified` renders with a black background to stand out; all other variants use a gray pill. Maps directly to the backend `qualification` field on a session.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Qualified: Story = { args: { variant: "qualified" } };
export const High: Story = { args: { variant: "high" } };
export const Medium: Story = { args: { variant: "medium" } };
export const Unclear: Story = { args: { variant: "unclear" } };
export const OutOfScope: Story = { args: { variant: "out_of_scope" } };

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Tag variant="qualified" />
      <Tag variant="high" />
      <Tag variant="medium" />
      <Tag variant="unclear" />
      <Tag variant="out_of_scope" />
    </div>
  ),
};

export const InboxRow: Story = {
  name: "Inbox row (qualified + high)",
  render: () => (
    <div className="flex gap-[5px]">
      <Tag variant="qualified" />
      <Tag variant="high" />
    </div>
  ),
};
