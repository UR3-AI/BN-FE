import type { RouteObject } from "react-router-dom";

import { ProtectedRoute, PublicRoute } from "@app/router/provider";

import { DashboardPage } from "@/mock/app/pages/dashboard";
import { EditorPage } from "@/mock/app/pages/editor";
import { GraphPage } from "@/mock/app/pages/graph";
import { LoginPage } from "@/mock/app/pages/login";
import { SearchPage } from "@/mock/app/pages/search";
import { SettingsPage } from "@/mock/app/pages/settings";
import { TodosPage } from "@/mock/app/pages/todos";

export const routes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/editor", element: <EditorPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/graph", element: <GraphPage /> },
      { path: "/todos", element: <TodosPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
];
