import type { RouteObject } from "react-router-dom";

import { ProtectedRoute, PublicRoute } from "@app/router/provider";

import { EditorPage } from "@/mock/app/pages/editor";
import { LoginPage } from "@/mock/app/pages/login";
import { SearchPage } from "@/mock/app/pages/search";

export const routes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <EditorPage /> },
      { path: "/search", element: <SearchPage /> },
    ],
  },
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
];
