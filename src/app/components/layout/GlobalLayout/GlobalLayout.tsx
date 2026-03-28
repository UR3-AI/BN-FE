import { Outlet } from "react-router-dom";

import { useHealthCheckQuery } from "@/lib/apis/queries";

const GlobalLayout = () => {
  useHealthCheckQuery();

  return <Outlet />;
};

export default GlobalLayout;
