import { Navigate, Outlet } from "react-router-dom";

import { useHealthCheckQuery } from "@/lib/apis/queries";
import { useAuthStore } from "@lib/stores";

const PublicRoute = () => {
  useHealthCheckQuery();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (isAuthenticated)
    return (
      <Navigate
        to="/"
        replace
      />
    );

  return <Outlet />;
};

export default PublicRoute;
