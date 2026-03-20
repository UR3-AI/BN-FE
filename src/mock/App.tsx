import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { queryClient } from "@lib/apis";
import { useTokenRefresh } from "@lib/hooks";
import { QueryClientProvider } from "@tanstack/react-query";

import { routes } from "./app/router/routes";

const router = createBrowserRouter(routes);

const MockApp = () => {
  useTokenRefresh();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default MockApp;
