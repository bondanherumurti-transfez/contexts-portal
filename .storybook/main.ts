import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  env: (existing) => ({
    ...existing,
    // Provide a fallback so env.ts doesn't throw during Storybook runs
    NEXT_PUBLIC_API_BASE:
      process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000",
  }),
};

export default config;
