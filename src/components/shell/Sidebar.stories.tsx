import type { Meta, StoryObj } from "@storybook/nextjs";
import { Sidebar } from "./Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Shell/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    // Sidebar is fixed-width so give it a constrained container
    layout: "fullscreen",
    backgrounds: { default: "white" },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/inbox",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const WithSites: Story = {
  name: "With sites (normal user)",
  args: { hasSites: true },
  parameters: {
    nextjs: { navigation: { pathname: "/inbox" } },
  },
};

export const NoSites: Story = {
  name: "No sites (first-time user, wireframe 07)",
  args: { hasSites: false },
  parameters: {
    nextjs: { navigation: { pathname: "/sites" } },
  },
};

export const ActiveKnowledgeBase: Story = {
  name: "Knowledge base active",
  args: { hasSites: true },
  parameters: {
    nextjs: { navigation: { pathname: "/knowledge-base/knowledge" } },
  },
};

export const ActiveSites: Story = {
  name: "Sites active",
  args: { hasSites: true },
  parameters: {
    nextjs: { navigation: { pathname: "/sites" } },
  },
};
