import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';
import AuthorizedRoute from './AuthorizedRoute';
import { PageTransition } from '../components/PageTransitions/PageTransition';

const Login = lazy(() => import('../pages/Login/Login'));
const Editor = lazy(() => import('../pages/Editor/Editor'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const TemplatePage = lazy(() => import('../pages/LinkPage/'));
const HomePage = lazy(() => import('../pages/HomePage/'));
const CreatePage = lazy(() => import('../pages/CreatePage/CreatePage'));
const PreviewPage = lazy(() => import('../pages/LinkPage'));

export const routes = [
  {
    path: '/',
    element: <PageTransition><HomePage /></PageTransition>
  },
  {
    path: '/login',
    element: <PageTransition><Login /></PageTransition>
  },
  {
    path: '/create',
    element: (
      <ProtectedRoute>
        <PageTransition><CreatePage /></PageTransition>
      </ProtectedRoute>
    )
  },
  {
    path: '/:pageURL/edit',
    element: (
      <AuthorizedRoute>
        <PageTransition><Editor /></PageTransition>
      </AuthorizedRoute>
    )
  },
  {
    path: '/:pageURL',
    element: <PageTransition><TemplatePage /></PageTransition>
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <PageTransition><Profile /></PageTransition>
      </ProtectedRoute>
    )
  },
  {
    path: '/_preview',
    element: <PreviewPage />
  }
]; 