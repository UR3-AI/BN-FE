import type { RouteObject } from 'react-router-dom'

import { GlobalLayout } from '@app/components'
import { HomePage, LoginPage, NotFoundPage } from '@app/pages'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <GlobalLayout />,
    children: [{ index: true, element: <HomePage /> }],
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
