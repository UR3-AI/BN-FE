import type { Meta, StoryObj } from "@storybook/react-vite";

import Button from "./Button";

/**
 * ## Button Component
 *
 * 다양한 variant와 size를 지원하는 범용 버튼 컴포넌트입니다.
 * 선택적으로 아이콘을 포함할 수 있으며, `s` 사이즈에서는 아이콘이 무시됩니다.
 *
 * ### 사용 방법
 * ```tsx
 * <Button variant="primary" size="l">
 *   확인
 * </Button>
 *
 * <Button variant="secondary" size="l" icon={<SomeIcon />}>
 *   아이콘 버튼
 * </Button>
 * ```
 *
 * ### Props
 * | Prop | Type | Default | Description |
 * |------|------|---------|-------------|
 * | `variant` | `"primary" \| "secondary" \| "tertiary" \| "text"` | `"primary"` | 버튼 스타일 변형 |
 * | `size` | `"s" \| "m" \| "l"` | `"l"` | 버튼 크기 |
 * | `icon` | `ReactNode` | - | 버튼 좌측에 표시할 아이콘 (s 사이즈에서 무시됨) |
 * | `isLoading` | `boolean` | `false` | 로딩 상태 (스피너 표시, 클릭 비활성화, variant 스타일 유지) |
 * | `disabled` | `boolean` | `false` | 버튼 비활성화 여부 |
 * | `children` | `ReactNode` | - | 버튼 텍스트 콘텐츠 |
 */
const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      description: "버튼 스타일 변형",
      control: "select",
      options: ["primary", "secondary", "tertiary", "text"],
    },
    size: {
      description: "버튼 크기 (s 사이즈에서는 아이콘이 무시됨)",
      control: "select",
      options: ["s", "m", "l"],
    },
    icon: {
      description: "버튼 좌측에 표시할 아이콘 (s 사이즈에서 무시됨)",
      control: false,
    },
    isLoading: {
      description: "로딩 상태 — 스피너 표시, 클릭 비활성화, variant 스타일 유지",
      control: "boolean",
    },
    disabled: {
      description: "버튼 비활성화 여부",
      control: "boolean",
    },
    children: {
      description: "버튼 텍스트 콘텐츠",
      control: false,
    },
    onClick: {
      description: "클릭 이벤트 핸들러",
      action: "clicked",
    },
  },
  args: {
    variant: "primary",
    size: "l",
    isLoading: false,
    disabled: false,
    children: "버튼",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 primary 버튼입니다.
 */
export const Default: Story = {};

/**
 * 모든 variant를 한눈에 비교할 수 있습니다.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="text">Text</Button>
    </div>
  ),
};

/**
 * 모든 size를 한눈에 비교할 수 있습니다.
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      <Button size="s">Small</Button>
      <Button size="m">Medium</Button>
      <Button size="l">Large</Button>
    </div>
  ),
};

/**
 * 아이콘이 포함된 버튼입니다. `m`, `l` 사이즈에서만 아이콘이 표시됩니다.
 */
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      <Button
        size="s"
        icon={
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
        }
      >
        S (아이콘 무시됨)
      </Button>
      <Button
        size="m"
        icon={
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
        }
      >
        M (아이콘 표시)
      </Button>
      <Button
        size="l"
        icon={
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
        }
      >
        L (아이콘 표시)
      </Button>
    </div>
  ),
};

/**
 * 비활성화된 버튼입니다. 모든 variant의 disabled 상태를 확인할 수 있습니다.
 */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        variant="primary"
        disabled
      >
        Primary
      </Button>
      <Button
        variant="secondary"
        disabled
      >
        Secondary
      </Button>
      <Button
        variant="tertiary"
        disabled
      >
        Tertiary
      </Button>
      <Button
        variant="text"
        disabled
      >
        Text
      </Button>
    </div>
  ),
};

/**
 * 로딩 중인 버튼입니다. 각 variant의 원래 스타일을 유지하면서 스피너가 표시됩니다.
 */
export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        variant="primary"
        isLoading
      >
        Primary
      </Button>
      <Button
        variant="secondary"
        isLoading
      >
        Secondary
      </Button>
      <Button
        variant="tertiary"
        isLoading
      >
        Tertiary
      </Button>
      <Button
        variant="text"
        isLoading
      >
        Text
      </Button>
    </div>
  ),
};

/**
 * 로딩 상태와 일반 상태를 나란히 비교할 수 있습니다.
 */
export const LoadingComparison: Story = {
  render: () => (
    <div
      className="flex flex-col gap-6"
      style={{ fontSize: "1.4rem" }}
    >
      {(["primary", "secondary", "tertiary", "text"] as const).map(variant => (
        <div
          key={variant}
          className="flex items-center gap-4"
        >
          <span
            className="w-[8rem] text-text-secondary"
            style={{ fontSize: "1.2rem" }}
          >
            {variant}
          </span>
          <Button variant={variant}>기본</Button>
          <Button
            variant={variant}
            isLoading
          >
            로딩
          </Button>
          <Button
            variant={variant}
            disabled
          >
            비활성
          </Button>
        </div>
      ))}
    </div>
  ),
};

/**
 * Controls 패널에서 variant, size, isLoading, disabled를 직접 조작해볼 수 있는 인터랙티브 스토리입니다.
 */
export const Playground: Story = {
  args: {
    variant: "primary",
    size: "l",
    isLoading: false,
    disabled: false,
    children: "버튼 텍스트",
  },
};
