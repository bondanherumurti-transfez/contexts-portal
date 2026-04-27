import type { Preview } from "@storybook/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import "../src/app/globals.css";

// Shared client for all stories — seeded with a preview user
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
});
queryClient.setQueryData(["user"], {
  user_id: "usr_preview",
  email: "preview@contextus.dev",
  display_name: "Preview User",
});
queryClient.setQueryData(["sites"], { sites: [] });

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(QueryClientProvider, { client: queryClient }, createElement(Story)),
  ],
  parameters: {
    backgrounds: {
      default: "white",
      values: [
        { name: "white", value: "#ffffff" },
        { name: "secondary", value: "#f0f0f0" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
