import "@/mock/index.css";

import type { Meta, StoryObj } from "@storybook/react-vite";

import SettingsPage from "./SettingsPage";

const meta = {
  title: "Mock/Pages/SettingsPage",
  component: SettingsPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
