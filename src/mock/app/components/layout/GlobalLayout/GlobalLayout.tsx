import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@/mock/app/components/Icons";

import { BottomNav } from "../BottomNav";
import { Sidebar } from "../Sidebar";
import { Topbar } from "../Topbar";

interface GlobalLayoutProps {
  children: ReactNode;
  topbarTitle?: string;
  breadcrumb?: { label: string; active?: boolean }[];
  showSearch?: boolean;
  sidePanel?: ReactNode;
}

const MIN_PANEL_WIDTH = 260;
const MAX_PANEL_WIDTH = 600;
const DEFAULT_PANEL_WIDTH = 320;

const GlobalLayout = ({
  children,
  topbarTitle,
  breadcrumb,
  showSearch,
  sidePanel,
}: GlobalLayoutProps) => {
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startW: panelWidth };
    },
    [panelWidth],
  );

  const onResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - e.clientX;
      setPanelWidth(
        Math.min(
          MAX_PANEL_WIDTH,
          Math.max(MIN_PANEL_WIDTH, dragRef.current.startW + delta),
        ),
      );
    },
    [],
  );

  const onResizePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={topbarTitle}
          breadcrumb={breadcrumb}
          showSearch={showSearch}
        />

        <main className="flex flex-1 overflow-y-auto">
          {children}

          {sidePanel && !panelOpen && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="hidden shrink-0 items-start border-l border-outline-variant/5 bg-surface-container-low px-[0.8rem] pt-[1.2rem] text-on-surface-variant/40 transition-colors hover:bg-surface-container hover:text-on-surface-variant xl:flex"
              aria-label="Open panel"
              title="Open panel">
              <ChevronLeftIcon
                size="1.6rem"
                stroke="currentColor"
              />
            </button>
          )}

          {sidePanel && panelOpen && (
            <>
              {/* Resize Handle */}
              <div
                className="hidden shrink-0 cursor-col-resize touch-none select-none items-stretch border-l border-outline-variant/5 bg-surface-container-low transition-colors hover:bg-primary/20 active:bg-primary/40 xl:flex"
                style={{ width: "6px" }}
                onPointerDown={onResizePointerDown}
                onPointerMove={onResizePointerMove}
                onPointerUp={onResizePointerUp}
              />

              {/* Panel */}
              <aside
                className="hidden shrink-0 flex-col overflow-hidden bg-surface-container-low xl:flex"
                style={{ width: `${panelWidth}px` }}>
                {/* Header: collapse >> */}
                <div className="flex items-center justify-end px-[1.2rem] py-[0.8rem]">
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="rounded-[0.25rem] p-[0.4rem] text-on-surface-variant/40 transition-colors hover:bg-surface-container hover:text-on-surface-variant"
                    aria-label="Close panel"
                    title="Close panel">
                    <ChevronRightIcon
                      size="1.6rem"
                      stroke="currentColor"
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  {sidePanel}
                </div>
              </aside>
            </>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default GlobalLayout;
