import type { Meta, StoryObj } from "@storybook/react-vite";

import LoadingSpinner from "./LoadingSpinner";

/**
 * ## LoadingSpinner Component
 *
 * 원형 스피너 형태의 로딩 인디케이터 컴포넌트입니다.
 * 크기, 테두리 두께, 색상을 자유롭게 지정할 수 있습니다.
 *
 * ### 사용 방법
 * ```tsx
 * <LoadingSpinner size="4rem" color="primary" />
 *
 * <div style={{ color: "#3b82f6" }}>
 *   <LoadingSpinner size="2rem" color="current" />
 * </div>
 * ```
 *
 * ### Props
 * | Prop | Type | Default | Description |
 * |------|------|---------|-------------|
 * | `size` | `string` | `"100%"` | 스피너 크기 (width/height 동시 적용) |
 * | `weight` | `string` | `"0.2rem"` | 스피너 테두리 두께 |
 * | `color` | `"current" \| "white" \| "black" \| "primary"` | `"current"` | 스피너 색상 |
 *
 * ### 주의사항
 * - `size` 기본값이 `"100%"`이므로 Story 및 단독 사용 시 명시적 크기 지정 필요
 * - `color="current"`는 부모 요소의 `color` CSS 속성을 상속합니다
 * - `color="white"`는 어두운 배경에서만 시각적으로 확인 가능합니다
 */
const meta = {
  title: "Components/LoadingSpinner",
  component: LoadingSpinner,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      description: "스피너 크기 (width/height 동시 적용). 기본값은 100%",
      control: "text",
    },
    weight: {
      description: "스피너 테두리 두께",
      control: "text",
    },
    color: {
      description: "스피너 색상. current는 부모의 color CSS 속성을 상속합니다",
      control: "select",
      options: ["current", "white", "black", "primary"],
    },
  },
  args: {
    size: "4rem",
    weight: "0.2rem",
    color: "primary",
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "3.2rem",
};

const colStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.8rem",
};

const labelStyle: React.CSSProperties = {
  color: "#666",
  fontSize: "1.2rem",
};

/**
 * 기본 스피너입니다. color="primary"로 파란색 스피너가 표시됩니다.
 */
export const Default: Story = {};

/**
 * 모든 color 옵션을 한눈에 비교할 수 있습니다.
 * current는 부모의 color를 상속하며, white는 어두운 배경에서만 확인 가능합니다.
 */
export const AllColors: Story = {
  render: () => (
    <div style={rowStyle}>
      <div style={colStyle}>
        <LoadingSpinner
          size="4rem"
          color="primary"
        />
        <span style={labelStyle}>primary</span>
      </div>
      <div style={colStyle}>
        <LoadingSpinner
          size="4rem"
          color="black"
        />
        <span style={labelStyle}>black</span>
      </div>
      <div style={{ ...colStyle, color: "#3b82f6" }}>
        <LoadingSpinner
          size="4rem"
          color="current"
        />
        <span style={labelStyle}>current</span>
      </div>
      <div
        style={{
          ...colStyle,
          background: "#333",
          padding: "1.2rem",
          borderRadius: "0.8rem",
        }}
      >
        <LoadingSpinner
          size="4rem"
          color="white"
        />
        <span style={{ color: "#999", fontSize: "1.2rem" }}>white</span>
      </div>
    </div>
  ),
};

/**
 * 다양한 크기의 스피너를 비교할 수 있습니다.
 */
export const AllSizes: Story = {
  render: () => (
    <div style={rowStyle}>
      <div style={colStyle}>
        <LoadingSpinner
          size="2rem"
          color="primary"
        />
        <span style={labelStyle}>2rem</span>
      </div>
      <div style={colStyle}>
        <LoadingSpinner
          size="4rem"
          color="primary"
        />
        <span style={labelStyle}>4rem</span>
      </div>
      <div style={colStyle}>
        <LoadingSpinner
          size="6rem"
          color="primary"
        />
        <span style={labelStyle}>6rem</span>
      </div>
      <div style={colStyle}>
        <LoadingSpinner
          size="8rem"
          color="primary"
        />
        <span style={labelStyle}>8rem</span>
      </div>
    </div>
  ),
};

/**
 * 테두리 두께(weight)에 따른 스피너 모양 변화를 확인할 수 있습니다.
 */
export const AllWeights: Story = {
  render: () => (
    <div style={rowStyle}>
      <div style={colStyle}>
        <LoadingSpinner
          size="5rem"
          weight="0.1rem"
          color="primary"
        />
        <span style={labelStyle}>0.1rem</span>
      </div>
      <div style={colStyle}>
        <LoadingSpinner
          size="5rem"
          weight="0.2rem"
          color="primary"
        />
        <span style={labelStyle}>0.2rem (기본)</span>
      </div>
      <div style={colStyle}>
        <LoadingSpinner
          size="5rem"
          weight="0.4rem"
          color="primary"
        />
        <span style={labelStyle}>0.4rem</span>
      </div>
      <div style={colStyle}>
        <LoadingSpinner
          size="5rem"
          weight="0.6rem"
          color="primary"
        />
        <span style={labelStyle}>0.6rem</span>
      </div>
    </div>
  ),
};

/**
 * color="current"는 부모 요소의 color CSS 속성을 그대로 상속합니다.
 * 버튼, 텍스트 등 다양한 색상 컨텍스트에서 활용할 수 있습니다.
 */
export const CurrentColor: Story = {
  render: () => (
    <div style={rowStyle}>
      <div style={{ ...colStyle, color: "#3b82f6" }}>
        <LoadingSpinner
          size="4rem"
          color="current"
        />
        <span style={{ fontSize: "1.2rem" }}>파란색 컨텍스트</span>
      </div>
      <div style={{ ...colStyle, color: "#d32f2f" }}>
        <LoadingSpinner
          size="4rem"
          color="current"
        />
        <span style={{ fontSize: "1.2rem" }}>빨간색 컨텍스트</span>
      </div>
      <div style={{ ...colStyle, color: "#2e7d32" }}>
        <LoadingSpinner
          size="4rem"
          color="current"
        />
        <span style={{ fontSize: "1.2rem" }}>초록색 컨텍스트</span>
      </div>
      <div style={{ ...colStyle, color: "#666" }}>
        <LoadingSpinner
          size="4rem"
          color="current"
        />
        <span style={{ fontSize: "1.2rem" }}>회색 컨텍스트</span>
      </div>
    </div>
  ),
};

/**
 * Controls 패널에서 size, weight, color를 직접 조작해볼 수 있는 인터랙티브 스토리입니다.
 */
export const Playground: Story = {
  args: {
    size: "4rem",
    weight: "0.2rem",
    color: "primary",
  },
};
