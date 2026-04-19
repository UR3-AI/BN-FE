import { Outlet } from "react-router-dom";

import { useHealthCheckQuery } from "@entities/health";
import { Sidebar } from "@widgets/sidebar";

const GlobalLayout = () => {
  useHealthCheckQuery();

  return (
    <main className="w-full h-full flex">
      <Sidebar />

      <section className="flex-1 h-full overflow-x-auto">
        <div className="min-w-[128rem] h-full">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

export default GlobalLayout;
