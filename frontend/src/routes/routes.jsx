import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';
import AuthorizedRoute from './AuthorizedRoute';

const Login = lazy(() => import('../pages/Login/Login'));
const Editor = lazy(() => import('../pages/Editor/Editor'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const TemplatePage = lazy(() => import('../pages/LinkPage/'));
const HomePage = lazy(() => import('../pages/HomePage/'));
const CreatePage = lazy(() => import('../pages/CreatePage/CreatePage'));

export const routes = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/create',
    element: (
      <ProtectedRoute>
        <CreatePage />
      </ProtectedRoute>
    )
  },
  {
    path: '/:pageURL/edit',
    element: (
      <AuthorizedRoute>
        <Editor />
      </AuthorizedRoute>
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