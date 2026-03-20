import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { routes } from "./app/router/routes";

const router = createBrowserRouter(routes);

const MockApp = () => {
  return <RouterProvider router={router} />;
};

export default MockApp;
