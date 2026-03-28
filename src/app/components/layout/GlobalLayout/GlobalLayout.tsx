import { Outlet } from "react-router-dom";

import { Sidebar } from "@app/containers";
import { useHealthCheckQuery } from "@/lib/apis/queries";

const GlobalLayout = () => {
  useHealthCheckQuery();

  return (
    <main className="w-full h-full flex">
      <Sidebar />

      <Outlet />
    </main>
  );
};

export default GlobalLayout;
