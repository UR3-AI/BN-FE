import type { RouteObject } from "react-router-dom";

import { ProtectedRoute, PublicRoute } from "@app/router/provider";

import { ArchivePage } from "@/mock/app/pages/archive";
import { ChatPage } from "@/mock/app/pages/chat";
import { DashboardPage } from "@/mock/app/pages/dashboard";
import { EditorPage } from "@/mock/app/pages/editor";
import { GraphPage } from "@/mock/app/pages/graph";
import { HelpPage } from "@/mock/app/pages/help";
import { LoginPage } from "@/mock/app/pages/login";
import { ProjectsPage } from "@/mock/app/pages/projects";
import { SearchPage } from "@/mock/app/pages/search";
import { SettingsPage } from "@/mock/app/pages/settings";
import { TodosPage } from "@/mock/app/pages/todos";

export const routes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <EditorPage /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/graph", element: <GraphPage /> },
      { path: "/todos", element: <TodosPage /> },
      { path: "/chat", element: <ChatPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/projects", element: <ProjectsPage /> },
      { path: "/archive", element: <ArchivePage /> },
      { path: "/help", element: <HelpPage /> },
    ],
  },
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
];
