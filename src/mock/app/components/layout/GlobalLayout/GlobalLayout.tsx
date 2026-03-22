import type { ReactNode } from "react";
import { useState } from "react";

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

const GlobalLayout = ({
  children,
  topbarTitle,
  breadcrumb,
  showSearch,
  sidePanel,
}: GlobalLayoutProps) => {
  const [panelOpen, setPanelOpen] = useState(true);

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

          {sidePanel && (
            <>
              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setPanelOpen(prev => !prev)}
                className="hidden items-center justify-center border-l border-outline-variant/5 bg-surface-container-low px-[0.4rem] text-on-surface-variant/40 transition-colors hover:bg-surface-container hover:text-on-surface-variant xl:flex"
                aria-label={panelOpen ? "Close panel" : "Open panel"}>
                {panelOpen ? (
                  <ChevronRightIcon
                    size="1.6rem"
                    stroke="currentColor"
                  />
                ) : (
                  <ChevronLeftIcon
                    size="1.6rem"
                    stroke="currentColor"
                  />
                )}
              </button>

              {/* Panel */}
              {panelOpen && (
                <aside className="hidden w-[32rem] flex-col overflow-y-auto border-l border-outline-variant/5 bg-surface-container-low xl:flex">
                  {sidePanel}
                </aside>
              )}
            </>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default GlobalLayout;
