import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The single button primitive used across the portal. Two variants: `outline` for secondary actions (cancel, request recrawl) and `solid` for primary actions (add Q&A, add to knowledge). Extends all native `<button>` attributes.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Outline: Story = {
  args: { variant: "outline", children: "request recrawl" },
};

export const Solid: Story = {
  args: { variant: "solid", children: "+ add Q&A" },
};

export const Disabled: Story = {
  args: { variant: "solid", children: "adding…", disabled: true },
};

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div className="flex items-center gap-3">
      <Button variant="outline">request recrawl</Button>
      <Button variant="solid">+ add Q&A</Button>
      <Button variant="outline" disabled>disabled</Button>
      <Button variant="solid" disabled>loading…</Button>
    </div>
  ),
};

export const SectionHeader: Story = {
  name: "Section header row (wireframe 03)",
  render: () => (
    <div className="w-[420px] flex justify-between items-center">
      <span className="text-[13px] font-medium text-primary">your added knowledge</span>
      <Button variant="solid">+ add Q&A</Button>
    </div>
  ),
};

export const ModalActions: Story = {
  name: "Modal action row (wireframe 10)",
  render: () => (
    <div className="flex justify-end gap-[10px]">
      <Button variant="outline">cancel</Button>
      <Button variant="solid">add to knowledge</Button>
    </div>
  ),
};
