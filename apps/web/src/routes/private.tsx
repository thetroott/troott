import DashboardLayout from "@/components/layouts/DashboardLayout";
import Home from "@/app/home/Home";
import Dashboard from "@/app/dashboard/Dashboard";
import Drafts from "@/app/dashboard/Drafts";
import Series from "@/app/dashboard/Series";
import Trash from "@/app/dashboard/Trash";
import GetStarted from "@/app/dashboard/GetStarted";
import Sermons from "@/app/dashboard/MySermons";
import Analytics from "@/app/dashboard/Analytics";
import InnerLayout from "@/components/layouts/InnerLayout";
import UploadSermon from "@/app/upload/UploadSermon";
import UserAccount from "@/app/account/GetVerified";
// import UserProfile from "@/app/profile/UserProfile";
import PersonalInfo from "@/app/account/VerifyUserInfo";
import VerifyDocument from "@/app/account/VerifyDocument";
import SelectDocumentType from "@/components/shared/get-started/SelectDocumentType";
import VerifyDocumentForm from "@/components/shared/get-started/verify-document";
import VerifyDocument1 from "@/components/shared/get-started/verify-document1";
import UploadDocument from "@/components/shared/get-started/UploadDocument";
import UploadDocumentWrapper from "@/components/shared/upload/UploadDocumentWrapper";
import DocumentUploadWrapper from "@/components/shared/upload/DocumentUploadWrapper";
import UserDraft from "@/app/dashboard/UserDraft";
import path from "path";
import HomeAddressForm from "@/components/shared/get-started/Home-address-form";
import HomeProfile from "@/app/account/HomeProfile";
import MinistryInput from "@/components/shared/get-started/MinistryInput";
import MinistryInputPage from "@/app/account/MinistryInfo";

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
          { path: "verify-account/home-address", element: <HomeProfile /> },
          {
            path: "verify-account/verify-document",
            element: <VerifyDocument />,
            children: [
              { index: true, path: "", element: <SelectDocumentType /> },
              { path: "document1", element: <VerifyDocument1 /> },
              { path: "select", element: <VerifyDocumentForm /> },
              { path: "upload", element: <UploadDocumentWrapper /> },
             
            ],
          },
          {
            path: "complete-profile",
            element: <HomeProfile/>,
            children: [
              {path: "home-address", element: <HomeAddressForm />},
              {path: "ministry-info", element: <MinistryInput />},
            ],
          },
          { path: "ministry-input", element: <MinistryInputPage /> },
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
        element: <Drafts />,
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
        element: <UserDraft />,
        roles: ["admin", "staff", "preacher"],
      },
      {
        path: "user-drafts",
        element: <UserDraft />,
        roles: ["admin", "staff", "preacher"],
      },
    ],
  },
];
