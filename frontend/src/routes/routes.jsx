import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';
import AuthorizedRoute from './AuthorizedRoute';
import { PageTransition } from '../components/PageTransitions/PageTransition';

const Login = lazy(() => import('../pages/Login/Login'));
const Editor = lazy(() => import('../pages/Editor/Editor'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const TemplatePage = lazy(() => import('../pages/LinkPage/'));
const HomePage = lazy(() => import('../pages/HomePage/'));
const TemplateSelector = lazy(() => import('../pages/TemplateSelector/TemplateSelector'));
const Registration = lazy(() => import('../pages/Registration/Registration'));
const Browser = lazy(() => import('../pages/browser/index'));
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
    path: '/templates',
    element: <PageTransition><TemplateSelector /></PageTransition>
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
    path: '/profile',
    element: (
      <ProtectedRoute>
        <PageTransition><Profile /></PageTransition>
      </ProtectedRoute>
    )
  },
  {
    path: '/:pageURL',
    element: <PageTransition><TemplatePage /></PageTransition>
  },
  {
    path: '/browser',
    element: <PageTransition><Browser /></PageTransition>
  },
  {
    path: '/register',
    element: <PageTransition><Registration /></PageTransition>
  }
]; 