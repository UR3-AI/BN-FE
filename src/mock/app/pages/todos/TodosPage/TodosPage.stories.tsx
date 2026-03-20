import "@/mock/index.css";

import type { Meta, StoryObj } from "@storybook/react-vite";

import TodosPage from "./TodosPage";

const meta = {
  title: "Mock/Pages/TodosPage",
  component: TodosPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TodosPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
