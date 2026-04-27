import type { Meta, StoryObj } from "@storybook/nextjs";
import { SiteCard } from "./SiteCard";

const meta: Meta<typeof SiteCard> = {
  title: "Sites/SiteCard",
  component: SiteCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Card for a single connected site in the Sites page (wireframe 06). Shows the site name, URL and crawl metadata, a manage/activate button, and the embed snippet ready to copy. `pending` dims the snippet and changes the button label to 'activate' for sites that haven't finished indexing. The embed snippet `data-knowledge-base-id` is sourced from `Site.kb_id`.",
      },
    },
  },
  decorators: [(Story) => <div className="w-[520px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof SiteCard>;

export const Active: Story = {
  name: "Active site",
  args: {
    name: "finfloo",
    url: "finfloo.com",
    pagesIndexed: 12,
    kbId: "kb_finfloo_xxx",
    pending: false,
  },
};

export const Pending: Story = {
  name: "Pending (not yet activated)",
  args: {
    name: "rubyh",
    url: "rubyh.dev",
    pagesIndexed: null,
    kbId: "kb_rubyh_xxx",
    pending: true,
  },
};

export const SitesList: Story = {
  name: "Sites list (wireframe 06)",
  render: () => (
    <div className="w-[520px]">
      <SiteCard
        name="finfloo"
        url="finfloo.com"
        pagesIndexed={12}
        kbId="kb_finfloo_xxx"
      />
      <SiteCard
        name="rubyh"
        url="rubyh.dev"
        pagesIndexed={null}
        kbId="kb_rubyh_xxx"
        pending
      />
      <div className="px-3 py-[9px] border-[0.5px] border-dashed border-[#888] rounded text-[12px] text-text-muted text-center mt-2">
        + add new site
      </div>
    </div>
  ),
};
