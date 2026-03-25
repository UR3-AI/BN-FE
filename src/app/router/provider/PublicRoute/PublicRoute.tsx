import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@lib/stores";

const PublicRoute = () => {
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
