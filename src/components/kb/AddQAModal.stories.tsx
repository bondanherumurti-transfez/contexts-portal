import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { AddQAModal } from "./AddQAModal";

const meta: Meta<typeof AddQAModal> = {
  title: "KB/AddQAModal",
  component: AddQAModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "white" },
    docs: {
      description: {
        component:
          "Modal for adding a Q&A pair to the knowledge base (wireframe 10). Triggered from two entry points: the '+ add Q&A' button in the section header (blank question) and the '+ answer this' CTA on a `GapCard` (question pre-filled from the gap title). Uses react-hook-form + zod with the same constraints enforced by the backend: question max 200 chars, answer max 2000 chars. Submits to `POST /api/portal/kb/enrich`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AddQAModal>;

function ModalWrapper({ defaultQuestion = "" }: { defaultQuestion?: string }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      {!open && (
        <div className="p-4">
          <button
            className="px-3 py-[5px] bg-primary text-white rounded text-[11px]"
            onClick={() => setOpen(true)}
          >
            open modal
          </button>
        </div>
      )}
      <AddQAModal
        open={open}
        defaultQuestion={defaultQuestion}
        onClose={() => setOpen(false)}
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 800));
          console.log("submitted", values);
          setOpen(false);
        }}
      />
    </>
  );
}

export const Empty: Story = {
  name: "Empty (add Q&A, wireframe 10)",
  render: () => <ModalWrapper />,
};

export const PrefilledFromGap: Story = {
  name: "Pre-filled from gap card",
  render: () => <ModalWrapper defaultQuestion="what are your prices for monthly bookkeeping?" />,
};
