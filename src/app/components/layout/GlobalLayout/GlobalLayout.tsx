import { Outlet } from "react-router-dom";

import { Sidebar } from "@app/containers";
import { useHealthCheckQuery } from "@/lib/apis/queries";

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
