import { Navigate } from 'react-router-dom';
import ActivateAccount from '@/app/auth/ActivateAccount';
import ForgotPassword from '@/app/auth/ForgotPassword';
import Login from '@/app/auth/Login';
import Register from '@/app/auth/Register';
import ResetPassword from '@/app/auth/ResetPassword';
import Verification from '@/app/auth/Verification';
import Preview from '@/app/Preview';
import NotFound from '@/app/error/NotFound';
import RouteFallback from '@/app/error/ErrorUI';
import Unauthorized from '@/app/error/Unauthorized';
import { IRoute } from '@/utils/interfaces';
import {
    PATH_ACTIVATE_ACCOUNT,
    PATH_FORGOT_PASSWORD,
    PATH_LOGIN,
    PATH_NO_NETWORK,
    PATH_NOT_FOUND,
    PATH_PREVIEW,
    PATH_REGISTER,
    PATH_RESET_PASSWORD,
    PATH_ROOT,
    PATH_ROUTE_FALLBACK,
    PATH_UNAUTHORIZED,
    PATH_VERIFY_OTP,
} from './paths';

const appRoutes: Array<IRoute> = [
    {
        name: 'root',
        url: PATH_ROOT,
        isAuth: false,
        path: PATH_ROOT,
        element: <Navigate to={PATH_LOGIN} replace />,
    },
    {
        name: 'login',
        url: PATH_LOGIN,
        isAuth: false,
        path: PATH_LOGIN,
        element: <Login />,
    },
    {
        name: 'register',
        url: PATH_REGISTER,
        isAuth: false,
        path: PATH_REGISTER,
        element: <Register />,
    },
    {
        name: 'activate-account',
        url: PATH_ACTIVATE_ACCOUNT,
        isAuth: false,
        path: PATH_ACTIVATE_ACCOUNT,
        element: <ActivateAccount />,
    },
    {
        name: 'verify-otp',
        url: PATH_VERIFY_OTP,
        isAuth: false,
        path: PATH_VERIFY_OTP,
        element: <Verification />,
    },
    {
        name: 'forgot-password',
        url: PATH_FORGOT_PASSWORD,
        isAuth: false,
        path: PATH_FORGOT_PASSWORD,
        element: <ForgotPassword />,
    },
    {
        name: 'reset-password',
        url: PATH_RESET_PASSWORD,
        isAuth: false,
        path: PATH_RESET_PASSWORD,
        element: <ResetPassword />,
    },
    {
        name: 'preview',
        url: PATH_PREVIEW,
        isAuth: false,
        path: PATH_PREVIEW,
        element: <Preview />,
    },
    {
        name: 'no-network',
        url: PATH_NO_NETWORK,
        isAuth: false,
        path: PATH_NO_NETWORK,
        element: <NotFound />,
    },
    {
        name: 'unauthorized',
        url: PATH_UNAUTHORIZED,
        isAuth: false,
        path: PATH_UNAUTHORIZED,
        element: <Unauthorized />,
    },
    {
        name: 'route-fallback',
        url: PATH_ROUTE_FALLBACK,
        isAuth: false,
        path: PATH_ROUTE_FALLBACK,
        element: <RouteFallback />,
    },
    {
        name: 'not-found',
        url: '*',
        isAuth: false,
        path: PATH_NOT_FOUND,
        element: <NotFound />,
        errorElement: <RouteFallback />,
    },
];

export default appRoutes;
