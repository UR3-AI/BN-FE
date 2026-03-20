import type { RouteObject } from "react-router-dom";

import { EditorPage } from "@/mock/app/pages/editor";
import { LoginPage } from "@/mock/app/pages/login";
import { SearchPage } from "@/mock/app/pages/search";

export const routes: RouteObject[] = [
  { path: "/", element: <EditorPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/search", element: <SearchPage /> },
];
