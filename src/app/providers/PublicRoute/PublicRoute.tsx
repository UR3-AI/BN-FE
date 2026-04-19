import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@entities/auth";
import { useHealthCheckQuery } from "@entities/health";

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
