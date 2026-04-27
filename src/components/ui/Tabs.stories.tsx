import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { Tabs } from "./Tabs";

const KB_TABS = [
  { label: "knowledge", value: "knowledge" },
  { label: "engagement", value: "engagement" },
  { label: "behavior", value: "behavior" },
];

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "white" },
    docs: {
      description: {
        component:
          "Tab strip used in the Knowledge Base section (wireframes 03–05). Active tab has a 1.5 px black bottom border and full-opacity text; inactive tabs are muted gray. In production the KB layout uses Next.js `<Link>` with `usePathname` for routing — this component is the presentational equivalent used for stories and any future non-router tab context.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

function TabsDemo({ defaultTab }: { defaultTab: string }) {
  const [active, setActive] = useState(defaultTab);
  return (
    <div className="w-[600px] border-hairline rounded-[8px] overflow-hidden">
      <Tabs tabs={KB_TABS} active={active} onChange={setActive} />
      <div className="p-4 text-[12px] text-text-muted font-mono">
        active: {active}
      </div>
    </div>
  );
}

export const KnowledgeActive: Story = {
  name: "Knowledge tab active (wireframe 03)",
  render: () => <TabsDemo defaultTab="knowledge" />,
};

export const EngagementActive: Story = {
  name: "Engagement tab active (wireframe 04)",
  render: () => <TabsDemo defaultTab="engagement" />,
};

export const BehaviorActive: Story = {
  name: "Behavior tab active (wireframe 05)",
  render: () => <TabsDemo defaultTab="behavior" />,
};
