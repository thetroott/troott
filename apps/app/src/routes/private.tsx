import DashboardLayout from "@/components/layouts/DashboardLayout";
import Home from "../screens/home/Home";
import Dashboard from "@/screens/dashboard/Dashboard";
import Drafts from "@/screens/dashboard/Drafts";
import Series from "@/screens/dashboard/Series";
import Trash from "@/screens/dashboard/Trash";
import GetStarted from "@/screens/dashboard/GetStarted";
import Sermons from "@/screens/dashboard/MySermons";
import Analytics from "@/screens/dashboard/Analytics";
import InnerLayout from "@/components/layouts/InnerLayout";
import UploadSermon from "@/screens/upload/UploadSermon";
import { UploadProvider } from "@/context/upload/upload.context";
import UserAccount from "@/screens/account/GetVerified";
import UserProfile from "@/screens/profile/UserProfile";
import PersonalInfo from "@/screens/account/VerifyUserInfo";
import VerifyDocument from "@/screens/account/VerifyDocument";
import SelectDocumentType from "@/components/shared/get-started/SelectDocumentType";
import VerifyDocumentForm from "@/components/shared/get-started/verify-document";
import UploadDocument from "@/components/shared/get-started/UploadDocument";
import LoginForm from "@/components/shared/auth/login-form";

export const privateRoutes = [
  {
    path: "/",
    element: <Home />,
    roles: ["admin", "staff", "minister"],
  },
  {
    path: "",
    element: <DashboardLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
        roles: ["admin", "staff", "minister"],
      },

      // get-started landing page
      {
        path: "get-started",
        element: <GetStarted />,
        roles: ["admin", "staff", "minister"],
      },

      // get-started sub routes using InnerLayout
      {
        path: "get-started",
        element: <InnerLayout />,
        roles: ["admin", "staff", "minister"],
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
        element: (
          <UploadProvider>
            <UploadSermon />
          </UploadProvider>
        ),
        roles: ["admin", "staff", "minister"],
      },
      {
        path: "get-sermons",
        element: <Sermons />,
        roles: ["admin", "staff", "minister"],
      },
      {
        path: "my-analytics",
        element: <Analytics />,
        roles: ["admin", "staff", "minister"],
      },
      {
        path: "my-drafts",
        element: <Drafts />,
        roles: ["admin", "staff", "minister"],
      },
      {
        path: "my-series",
        element: <Series />,
        roles: ["admin", "staff", "minister"],
      },
      {
        path: "my-trash",
        element: <Trash />,
        roles: ["admin", "staff", "minister"],
      },
    ],
  },
];
