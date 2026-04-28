import type { Meta, StoryObj } from "@storybook/nextjs";
import { Topbar } from "./Topbar";
import type { Site } from "@/lib/api/types";

/**
 * The application topbar shown above every authenticated page.
 *
 * Left side: shows the active site's URL (or "your sites" on the /sites route).
 * Right side: on knowledge-base routes, shows "last crawled {date} · {N} pages" in mono.
 */
const meta: Meta<typeof Topbar> = {
  title: "Shell/Topbar",
  component: Topbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "white" },
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/inbox" },
    },
    docs: {
      description: {
        component:
          "Application topbar. Shows the active site label on the left. On knowledge-base routes, shows crawl metadata (date and page count) on the right.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full border-b border-[#E0E0E0]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Topbar>;

const SITE_WITH_CRAWL: Site = {
  kb_id: "kb_finfloo",
  url: "https://finfloo.com",
  name: "Finfloo",
  token: "kb_finfloo",
  created_at: 1777300000,
  last_crawled_at: 1714521600,
  pages_indexed: 12,
};

const SITE_NO_CRAWL: Site = {
  kb_id: "kb_finfloo",
  url: "https://finfloo.com",
  name: "Finfloo",
  token: "kb_finfloo",
  created_at: 1777300000,
  last_crawled_at: null,
  pages_indexed: null,
};

/** Default state on inbox or sites routes — shows site URL, no right-side metadata. */
export const OnInbox: Story = {
  name: "Inbox route (no metadata)",
  args: { sites: [SITE_WITH_CRAWL] },
  parameters: {
    nextjs: { navigation: { pathname: "/inbox" } },
  },
};

/** On a knowledge-base route — shows last crawled date and page count on the right. */
export const OnKnowledgeBase: Story = {
  name: "Knowledge base route (with crawl metadata)",
  args: { sites: [SITE_WITH_CRAWL] },
  parameters: {
    nextjs: { navigation: { pathname: "/knowledge-base/knowledge" } },
  },
};

/** Knowledge-base route but site has never been crawled — right side is empty. */
export const KBNoCrawlData: Story = {
  name: "Knowledge base route (site not yet crawled)",
  args: { sites: [SITE_NO_CRAWL] },
  parameters: {
    nextjs: { navigation: { pathname: "/knowledge-base/knowledge" } },
  },
};

/** On /sites route — shows "your sites" regardless of actual site data. */
export const OnSites: Story = {
  name: "Sites route",
  args: { sites: [SITE_WITH_CRAWL] },
  parameters: {
    nextjs: { navigation: { pathname: "/sites" } },
  },
};

/** No sites yet (first-time user). */
export const NoSites: Story = {
  name: "No sites (first-time user)",
  args: { sites: [] },
  parameters: {
    nextjs: { navigation: { pathname: "/sites" } },
  },
};
