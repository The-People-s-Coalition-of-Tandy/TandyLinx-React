import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';

const Login = lazy(() => import('../pages/Login/Login'));
const Editor = lazy(() => import('../pages/Editor/Editor'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const TemplatePage = lazy(() => import('../components/TemplateBrowser/TemplatePage'));

export const routes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/:pageURL/edit',
    element: (
      <ProtectedRoute>
        <Editor />
      </ProtectedRoute>
    )
  },
  {
    path: '/:pageURL',
    element: <TemplatePage />
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  }
]; 