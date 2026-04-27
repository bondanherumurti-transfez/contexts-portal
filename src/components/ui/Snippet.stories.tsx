import type { Meta, StoryObj } from "@storybook/nextjs";
import { Snippet } from "./Snippet";

const meta: Meta<typeof Snippet> = {
  title: "UI/Snippet",
  component: Snippet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Mono code block for displaying the widget embed script. A copy button appears on hover (top-right corner) and shows 'copied' for 2 seconds after clicking. Used in the inbox empty state (wireframe 08) and inside `SiteCard` (wireframe 06). Whitespace and newlines in `code` are preserved.",
      },
    },
  },
  decorators: [(Story) => <div className="w-[420px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Snippet>;

export const EmbedScript: Story = {
  name: "Embed script",
  args: {
    code: `<script src="https://contextus.dev/widget/floating.js"\n  data-knowledge-base-id="kb_finfloo_xxx"></script>`,
  },
};

export const LongCode: Story = {
  name: "Long single-line code",
  args: {
    code: `<script src="https://contextus.dev/widget/floating.js" data-knowledge-base-id="kb_finfloo_xxx_very_long_id_here"></script>`,
  },
};
