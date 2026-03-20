import "@/mock/index.css";

import type { Meta, StoryObj } from "@storybook/react-vite";

import EditorPage from "./EditorPage";

const meta = {
  title: "Mock/Pages/EditorPage",
  component: EditorPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof EditorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
