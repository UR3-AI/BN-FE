import "@/mock/index.css";

import type { Meta, StoryObj } from "@storybook/react-vite";

import SearchPage from "./SearchPage";

const meta = {
  title: "Mock/Pages/SearchPage",
  component: SearchPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SearchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
