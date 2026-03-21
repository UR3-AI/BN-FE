import type { ReactNode } from "react";

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
            <aside className="hidden w-[32rem] flex-col overflow-y-auto border-l border-outline-variant/5 bg-surface-container-low xl:flex">
              {sidePanel}
            </aside>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default GlobalLayout;
