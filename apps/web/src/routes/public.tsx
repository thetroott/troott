import ActivateAccount from "@/app/auth/ActivateAccount";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Register = lazy(() => import("../app/auth/Register"));
const Verification = lazy(() => import("../app/auth/Verification"));
const Login = lazy(() => import("../app/auth/Login"));
const ForgotPassword = lazy(() => import("../app/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../app/auth/ResetPassword"));
const Preview = lazy(() => import("../app/Preview"));

export const publicRoutes = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/activate",
    element: <ActivateAccount />,
  },
  {
    path: "/verify-otp",
    element: <Verification />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    path: "/preview",
    element: <Preview />
  },
];
