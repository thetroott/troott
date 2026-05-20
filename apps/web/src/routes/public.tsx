import ActivateAccount from '@/app/auth/ActivateAccount';
import { AuthRootRedirect } from '@/components/shared/auth/AuthRootRedirect';
import {
    AUTH_ROUTE_ACTIVATE_LEGACY,
    AUTH_ROUTES,
} from '@/constants/auth-routes';
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const Register = lazy(() => import('../app/auth/Register'));
const Verification = lazy(() => import('../app/auth/Verification'));
const Login = lazy(() => import('../app/auth/Login'));
const ForgotPassword = lazy(() => import('../app/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../app/auth/ResetPassword'));
const Preview = lazy(() => import('../app/Preview'));

export const publicRoutes = [
    {
        path: '/',
        element: <AuthRootRedirect />,
    },
    {
        path: AUTH_ROUTES.register,
        element: <Register />,
    },
    {
        path: AUTH_ROUTES.activateAccount,
        element: <ActivateAccount />,
    },
    {
        path: AUTH_ROUTE_ACTIVATE_LEGACY,
        element: (
            <Navigate to={AUTH_ROUTES.activateAccount} replace />
        ),
    },
    {
        path: AUTH_ROUTES.verifyOtp,
        element: <Verification />,
    },
    {
        path: AUTH_ROUTES.login,
        element: <Login />,
    },
    {
        path: AUTH_ROUTES.forgotPassword,
        element: <ForgotPassword />,
    },
    {
        path: AUTH_ROUTES.resetPassword,
        element: <ResetPassword />,
    },
    {
        path: '/preview',
        element: <Preview />,
    },
    {
        path: '/peview',
        element: <Preview />,
    },
];
