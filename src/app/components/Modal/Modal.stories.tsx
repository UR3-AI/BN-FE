import { useState } from "react";

import { Button } from "@app/components";
import type { Meta, StoryObj } from "@storybook/react-vite";

import Modal from "./Modal";

/**
 * ## Modal Component
 *
 * motion/react 애니메이션과 Portal을 사용한 모달 컴포넌트입니다.
 * Away Click 및 ESC 키로 닫기 기능을 제공하며, 선택적으로 닫기 아이콘을 표시할 수 있습니다.
 *
 * ### 사용 방법
 * ```tsx
 * const [isShow, setIsShow] = useState(false)
 *
 * <Modal
 *   isShow={isShow}
 *   onClose={() => setIsShow(false)}>
 *   <p>모달 콘텐츠</p>
 * </Modal>
 * ```
 *
 * ### Props
 * | Prop | Type | Default | Description |
 * |------|------|---------|-------------|
 * | `children` | `ReactNode` | - | 모달 내부에 렌더링될 콘텐츠 |
 * | `isShow` | `boolean` | - | 모달 표시 여부 |
 * | `onClose` | `() => void` | - | 모달 닫기 콜백 (배경 클릭, ESC 키, 닫기 버튼) |
 * | `disableAwayClick` | `boolean` | `false` | 배경 클릭 및 ESC 키로 닫기 비활성화 |
 * | `hideCloseIcon` | `boolean` | `false` | 우측 상단 닫기(✕) 버튼 숨김 |
 */
const meta = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: {
      description: "모달 내부에 렌더링될 콘텐츠",
      control: false,
    },
    isShow: {
      description: "모달 표시 여부",
      control: "boolean",
    },
    onClose: {
      description: "모달 닫기 콜백 함수 (배경 클릭, ESC 키, 닫기 버튼)",
      action: "onClose",
    },
    disableAwayClick: {
      description: "배경 클릭으로 닫기 비활성화 여부",
      control: "boolean",
    },
    hideCloseIcon: {
      description: "우측 상단 닫기(X) 버튼 숨김 여부",
      control: "boolean",
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 모달 열기/닫기 상태를 직접 제어할 수 있는 인터랙티브 래퍼입니다.
 */
const ModalWithTrigger = ({
  disableAwayClick = false,
  hideCloseIcon = false,
  children,
}: {
  disableAwayClick?: boolean;
  hideCloseIcon?: boolean;
  children: React.ReactNode;
}) => {
  const [isShow, setIsShow] = useState(false);

  return (
    <>
      <Button onClick={() => setIsShow(true)}>모달 열기</Button>
      <Modal
        isShow={isShow}
        onClose={() => setIsShow(false)}
        disableAwayClick={disableAwayClick}
        hideCloseIcon={hideCloseIcon}
      >
        {children}
      </Modal>
    </>
  );
};

/**
 * 기본 모달입니다. 우측 상단 닫기 버튼, 배경 클릭, ESC 키로 닫을 수 있습니다.
 */
export const Default: Story = {
  render: () => (
    <ModalWithTrigger>
      <div className="w-72">
        <h2
          className="mb-2 font-semibold"
          style={{ fontSize: "1.8rem" }}
        >
          모달 제목
        </h2>
        <p
          className="text-gray-600"
          style={{ fontSize: "1.4rem" }}
        >
          기본 모달입니다. 우측 상단 X 버튼, 배경 클릭, ESC 키로 닫을 수 있습니다.
        </p>
      </div>
    </ModalWithTrigger>
  ),
  args: {
    children: null,
    isShow: false,
    onClose: () => {},
    disableAwayClick: false,
    hideCloseIcon: false,
  },
};

/**
 * 닫기 버튼이 숨겨진 모달입니다. 배경 클릭 또는 ESC 키로만 닫을 수 있습니다.
 */
export const HideCloseIcon: Story = {
  render: () => (
    <ModalWithTrigger hideCloseIcon>
      <div className="w-72">
        <h2
          className="mb-2 font-semibold"
          style={{ fontSize: "1.8rem" }}
        >
          닫기 버튼 없음
        </h2>
        <p
          className="text-gray-600"
          style={{ fontSize: "1.4rem" }}
        >
          닫기(X) 버튼이 숨겨진 모달입니다. 배경 클릭 또는 ESC 키로 닫을 수 있습니다.
        </p>
      </div>
    </ModalWithTrigger>
  ),
  args: {
    children: null,
    isShow: false,
    onClose: () => {},
    hideCloseIcon: true,
    disableAwayClick: false,
  },
};

/**
 * 배경 클릭으로 닫기가 비활성화된 모달입니다. 반드시 닫기 버튼 또는 ESC 키를 사용해야 합니다.
 */
export const DisableAwayClick: Story = {
  render: () => (
    <ModalWithTrigger disableAwayClick>
      <div className="w-72">
        <h2
          className="mb-2 font-semibold"
          style={{ fontSize: "1.8rem" }}
        >
          배경 클릭 비활성화
        </h2>
        <p
          className="text-gray-600"
          style={{ fontSize: "1.4rem" }}
        >
          배경을 클릭해도 닫히지 않습니다. X 버튼 또는 ESC 키로만 닫을 수 있습니다.
        </p>
      </div>
    </ModalWithTrigger>
  ),
  args: {
    children: null,
    isShow: false,
    onClose: () => {},
    disableAwayClick: true,
    hideCloseIcon: false,
  },
};

/**
 * 배경 클릭과 닫기 버튼이 모두 비활성화된 모달입니다. ESC 키로만 닫을 수 있습니다.
 */
export const Locked: Story = {
  render: () => (
    <ModalWithTrigger
      disableAwayClick
      hideCloseIcon
    >
      <div className="w-72">
        <h2
          className="mb-2 font-semibold"
          style={{ fontSize: "1.8rem" }}
        >
          잠금 모달
        </h2>
        <p
          className="text-gray-600"
          style={{ fontSize: "1.4rem" }}
        >
          배경 클릭과 닫기 버튼이 모두 비활성화되어 있습니다. ESC 키로만 닫을 수 있습니다.
        </p>
      </div>
    </ModalWithTrigger>
  ),
  args: {
    children: null,
    isShow: false,
    onClose: () => {},
    disableAwayClick: true,
    hideCloseIcon: true,
  },
};

/**
 * 긴 콘텐츠가 담긴 모달입니다. 스크롤이 지원됩니다.
 */
export const WithLongContent: Story = {
  render: () => (
    <ModalWithTrigger>
      <div
        className="w-[40rem] overflow-y-auto"
        style={{ maxHeight: "50vh" }}
      >
        <h2
          className="mb-4 font-semibold"
          style={{ fontSize: "1.8rem" }}
        >
          긴 콘텐츠 모달
        </h2>
        {Array.from({ length: 20 }, (_, i) => (
          <p
            key={i}
            className="mb-3 text-gray-600"
            style={{ fontSize: "1.4rem" }}
          >
            콘텐츠 항목 {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        ))}
      </div>
    </ModalWithTrigger>
  ),
  args: {
    children: null,
    isShow: false,
    onClose: () => {},
    disableAwayClick: false,
    hideCloseIcon: false,
  },
};
