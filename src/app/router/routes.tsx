import type { RouteObject } from 'react-router-dom'

import { HomePage, LoginPage, NotFoundPage } from '@app/pages'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]
