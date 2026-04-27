import type { Meta, StoryObj } from "@storybook/nextjs";
import { SessionListItem } from "./SessionListItem";

const meta: Meta<typeof SessionListItem> = {
  title: "Inbox/SessionListItem",
  component: SessionListItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "One row in the inbox session list (left pane, wireframe 02). Shows visitor name, relative time, a one-line preview, and qualification tag chips. The `active` state highlights the row to indicate the selected session — driven by `?session=` in the URL, not local state.",
      },
    },
  },
  decorators: [(Story) => <div className="w-[260px] border-hairline"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof SessionListItem>;

export const Default: Story = {
  args: {
    name: "budi santoso",
    time: "2h",
    preview: "restaurant chain, 3 outlets",
    tags: ["qualified", "high"],
    active: false,
  },
};

export const Active: Story = {
  args: {
    name: "budi santoso",
    time: "2h",
    preview: "restaurant chain, 3 outlets",
    tags: ["qualified", "high"],
    active: true,
  },
};

export const Unclear: Story = {
  args: {
    name: "anonymous",
    time: "1d",
    preview: "price comparison only",
    tags: ["unclear"],
    active: false,
  },
};

export const OutOfScope: Story = {
  args: {
    name: "— spam —",
    time: "3d",
    preview: "crypto promotion",
    tags: ["out_of_scope"],
    active: false,
  },
};

export const List: Story = {
  name: "Session list (wireframe 02)",
  render: () => (
    <div className="w-[260px] border-hairline">
      <SessionListItem
        name="budi santoso"
        time="2h"
        preview="restaurant chain, 3 outlets"
        tags={["qualified", "high"]}
        active
      />
      <SessionListItem
        name="sari wijaya"
        time="5h"
        preview="tax filing, fashion shop"
        tags={["qualified", "medium"]}
      />
      <SessionListItem
        name="anonymous"
        time="1d"
        preview="price comparison only"
        tags={["unclear"]}
      />
      <SessionListItem
        name="putra hadi"
        time="2d"
        preview="payroll for 50 employees"
        tags={["qualified", "high"]}
      />
      <SessionListItem
        name="— spam —"
        time="3d"
        preview="crypto promotion"
        tags={["out_of_scope"]}
      />
    </div>
  ),
};
