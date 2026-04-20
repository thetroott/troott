import DashboardLayout from "@/components/layouts/DashboardLayout";
import Home from "@/app/home/Home";
import Dashboard from "@/app/dashboard/Dashboard";
import Series from "@/app/dashboard/Series";
import Trash from "@/app/dashboard/Trash";
import GetStarted from "@/app/dashboard/GetStarted";
import Sermons from "@/app/dashboard/MySermons";
import Analytics from "@/app/dashboard/Analytics";
import InnerLayout from "@/components/layouts/InnerLayout";
import UploadSermon from "@/app/upload/UploadSermon";
import UserAccount from "@/app/account/GetVerified";
import UserProfile from "@/app/profile/UserProfile";
import PersonalInfo from "@/app/account/VerifyUserInfo";
import VerifyDocument from "@/app/account/VerifyDocument";
import SelectDocumentType from "@/components/shared/get-started/SelectDocumentType";
import VerifyDocumentForm from "@/components/shared/get-started/verify-document";
import UploadDocument from "@/components/shared/get-started/UploadDocument";
import LoginForm from "@/components/shared/auth/login-form";
import { Navigate } from "react-router-dom";

export const privateRoutes = [
  {
    path: "/",
    element: <Home />,
    roles: ["admin", "staff", "preacher"],
  },
  {
    path: "",
    element: <DashboardLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
        roles: ["admin", "staff", "preacher"],
      },

      // get-started landing page
      {
        path: "get-started",
        element: <GetStarted />,
        roles: ["admin", "staff", "preacher"],
      },

      // get-started sub routes using InnerLayout
      {
        path: "get-started",
        element: <InnerLayout />,
        roles: ["admin", "staff", "preacher"],
        children: [
          { path: "verify-account", element: <UserAccount /> },
          { path: "verify-account/personal-information", element: <PersonalInfo /> },
          {
            path: "verify-account/verify-document",
            element: <VerifyDocument />,
            children: [
              { index: true, path: "", element: <SelectDocumentType /> },
              { path: "select", element: <VerifyDocumentForm /> },
              { path: "upload", element: <UploadDocument /> },
              { path: "start", element: <LoginForm /> },
            ],
          },
          {
            path: "complete-profile",
            element: <UserProfile />,
          },
        ],
      },

      // get-started tour guide

      {
        path: "get-started/tour-guide",
        element: <UploadSermon />,
      },

      // other dashboard routes
      {
        path: "upload-sermon",
        element: <UploadSermon />,
        roles: ["admin", "staff", "preacher"],
      },
      {
        path: "upload",
        element: <Navigate to="/upload-sermon" replace />,
        roles: ["admin", "staff", "preacher"],
      },
      {
        path: "get-sermons",
        element: <Sermons />,
        roles: ["admin", "staff", "preacher"],
      },
      {
        path: "my-sermon",
        element: <Sermons />,
        roles: ["admin", "staff", "preacher"],
      },
      {
        path: "my-analytics",
        element: <Analytics />,
        roles: ["admin", "staff", "preacher"],
      },
      {
        path: "my-drafts",
        element: <Navigate to="/get-sermons" replace />,
        roles: ["admin", "staff", "preacher"],
      },
      {
        path: "my-series",
        element: <Series />,
        roles: ["admin", "staff", "preacher"],
      },
      {
        path: "my-trash",
        element: <Trash />,
        roles: ["admin", "staff", "preacher"],
      },
      {
        path: "user-draft",
        element: <Navigate to="/get-sermons" replace />,
        roles: ["admin", "staff", "preacher"],
      },
      {
        path: "user-drafts",
        element: <Navigate to="/get-sermons" replace />,
        roles: ["admin", "staff", "preacher"],
      },
    ],
  },
];
