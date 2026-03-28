import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

import { GlobalLayout } from "@app/components";
import { ChatPage, GraphPage, LoginPage, NotFoundPage, NotePage, TodoPage } from "@app/pages";

import { ProtectedRoute, PublicRoute } from "./provider";

export const routes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <GlobalLayout />,
        children: [
          {
            index: true,
            element: (
              <Navigate
                to="/note"
                replace
              />
            ),
          },
          { path: "note", element: <NotePage /> },
          { path: "graph", element: <GraphPage /> },
          { path: "todo", element: <TodoPage /> },
          { path: "chat", element: <ChatPage /> },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  { path: "*", element: <NotFoundPage /> },
];
