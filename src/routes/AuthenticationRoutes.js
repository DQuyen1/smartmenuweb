import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import ResetPassword3 from 'views/pages/authentication/authentication3/ResetPassword3';
import { element } from 'prop-types';
import UserMailVerify from 'views/pages/authentication/authentication3/UserMailVerify';
import AuthForgotPassword from 'views/pages/authentication/auth-forms/AuthForgotPassword';

// login option 3 routing
const AuthLogin3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Login3')));
const Template = Loadable(lazy(() => import('views/utilities/Template')));
const Test = Loadable(lazy(() => import('views/utilities/renderTemplate')));
const Display = Loadable(lazy(() => import('views/utilities/Display')));
const ChooseTemplate = Loadable(lazy(() => import('views/sample-page/ChooseTemplate')));
const ConfirmPassword = Loadable(lazy(() => import('views/pages/authentication/authentication3/ConfirmPassword')));
const Checking = Loadable(lazy(() => import('views/sample-page/Checking')));
const AdminChooseTemplate = Loadable(lazy(() => import('views/sample-page/AdminChooseTemplate')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/pages/template/:templateId',
      element: <Template />
    },
    {
      path: '/pages/display/:templateId',
      element: <Display />
    },
    {
      path: '/pages/choose-template',
      element: <ChooseTemplate />
    },
    {
      path: '/pages/getTemplate',
      element: <Test />
    },
    {
      path: '/',
      element: <AuthLogin3 />
    },
    {
      path: '/pages/checking',
      element: <Checking />
    },
    {
      path: '/pages/confirm-password',
      element: <ConfirmPassword />
    },
    {
      path: '/pages/admin-choose-template',
      element: <AdminChooseTemplate />
    },
    {
      path: '/pages/reset-password',
      element: <ResetPassword3 />
    },
    {
      path: '/pages/email-verify',
      element: <UserMailVerify />
    },
    {
      path: '/pages/forgot-password',
      element: <AuthForgotPassword />
    }
  ]
};

export default AuthenticationRoutes;
