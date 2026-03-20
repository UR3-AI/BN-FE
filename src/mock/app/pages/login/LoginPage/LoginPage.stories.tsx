import "@/mock/index.css";

import type { Meta, StoryObj } from "@storybook/react-vite";

import LoginPage from "./LoginPage";

const meta = {
  title: "Mock/Pages/LoginPage",
  component: LoginPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
