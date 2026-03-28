import type { Meta, StoryObj } from "@storybook/react-vite";

import { CloseIcon } from "./index";

/**
 * ## Icons
 *
 * 프로젝트에서 사용하는 SVG 아이콘 컴포넌트 모음입니다.
 * 모든 아이콘은 `IconCommonProps`를 공유하며 `SVGProps<SVGSVGElement>`를 확장합니다.
 *
 * ### 공통 Props (IconCommonProps)
 * | Prop | Type | Default | Description |
 * |------|------|---------|-------------|
 * | `size` | `string` | `"1.5rem"` | 아이콘 크기 (width, height 동시 적용) |
 * | `fill` | `string` | `"none"` | SVG fill 색상 |
 * | `stroke` | `string` | `"currentColor"` | SVG stroke 색상 (CloseIcon) |
 *
 * ### 사용 방법
 * ```tsx
 * import { CloseIcon } from "@app/components/Icons"
 *
 * <CloseIcon size="2rem" stroke="#ff0000" />
 * ```
 */
const meta = {
  title: "Components/Icons",
  component: CloseIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      description: "아이콘 크기 (width, height 동시 적용)",
      control: "text",
    },
    fill: {
      description: "SVG fill 색상",
      control: "color",
    },
    stroke: {
      description: "SVG stroke 색상",
      control: "color",
    },
  },
  args: {
    size: "1.5rem",
    fill: "none",
    stroke: "currentColor",
  },
} satisfies Meta<typeof CloseIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * CloseIcon 기본 상태입니다.
 */
export const Default: Story = {};

/**
 * 프로젝트에 등록된 모든 아이콘을 한눈에 확인할 수 있습니다.
 */
export const AllIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <div className="flex flex-col items-center gap-2">
        <CloseIcon />
        <span
          className="text-gray-500"
          style={{ fontSize: "1.2rem" }}
        >
          CloseIcon
        </span>
      </div>
    </div>
  ),
};

/**
 * 다양한 크기의 CloseIcon을 비교할 수 있습니다.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col items-center gap-2">
        <CloseIcon size="1rem" />
        <span
          className="text-gray-500"
          style={{ fontSize: "1.2rem" }}
        >
          1rem
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CloseIcon size="1.5rem" />
        <span
          className="text-gray-500"
          style={{ fontSize: "1.2rem" }}
        >
          1.5rem (기본)
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CloseIcon size="2rem" />
        <span
          className="text-gray-500"
          style={{ fontSize: "1.2rem" }}
        >
          2rem
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CloseIcon size="3rem" />
        <span
          className="text-gray-500"
          style={{ fontSize: "1.2rem" }}
        >
          3rem
        </span>
      </div>
    </div>
  ),
};

/**
 * 다양한 stroke 색상의 CloseIcon을 비교할 수 있습니다.
 */
export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <CloseIcon
          size="2rem"
          stroke="currentColor"
        />
        <span
          className="text-gray-500"
          style={{ fontSize: "1.2rem" }}
        >
          currentColor
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CloseIcon
          size="2rem"
          stroke="#3b82f6"
        />
        <span
          className="text-gray-500"
          style={{ fontSize: "1.2rem" }}
        >
          #3b82f6
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CloseIcon
          size="2rem"
          stroke="#ef4444"
        />
        <span
          className="text-gray-500"
          style={{ fontSize: "1.2rem" }}
        >
          #ef4444
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CloseIcon
          size="2rem"
          stroke="#22c55e"
        />
        <span
          className="text-gray-500"
          style={{ fontSize: "1.2rem" }}
        >
          #22c55e
        </span>
      </div>
    </div>
  ),
};

/**
 * Controls 패널에서 size, fill, stroke를 직접 조작해볼 수 있는 인터랙티브 스토리입니다.
 */
export const Playground: Story = {
  args: {
    size: "2rem",
    fill: "none",
    stroke: "currentColor",
  },
};
