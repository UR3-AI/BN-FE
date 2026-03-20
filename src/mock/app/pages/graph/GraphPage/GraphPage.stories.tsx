import "@/mock/index.css";

import type { Meta, StoryObj } from "@storybook/react-vite";

import GraphPage from "./GraphPage";

const meta = {
  title: "Mock/Pages/GraphPage",
  component: GraphPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof GraphPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
