import type { RouteObject } from "react-router-dom";

import { ProtectedRoute, PublicRoute } from "@app/router/provider";

import { EditorPage } from "@/mock/app/pages/editor";
import { GraphPage } from "@/mock/app/pages/graph";
import { LoginPage } from "@/mock/app/pages/login";
import { SearchPage } from "@/mock/app/pages/search";
import { SettingsPage } from "@/mock/app/pages/settings";

export const routes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <EditorPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/graph", element: <GraphPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
];
