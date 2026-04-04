import { DotIcon } from "lucide-react";

const OnboardingItems = [
  {
    id: "1",
    icon: DotIcon,
    title: "Verify your account",
    text: "Add the required information to verify your account and avoid any interruptions to your access or sermon publishing.",
    button: "Verify account",
    action: "/get-started/verify-account",
    steps: [
      {
        id: "1",
        title: "Personal Information",
        action: "/get-started/verify-account/personal-information",
      },
      {
        id: "2",
        title: "Document Verification",
        action: "/get-started/verify-account/verify-document",
      },
      {
        id: "3",
        title: "Document Verification",
        action: "/get-started/verify-account/verify-document/select",
      },
      {
        id: "4",
        title: "Upload your documents",
        action: "/get-started/verify-account/verify-document/upload",
      },
      {
        id: "5",
        title: "Document Verification",
        action: "/get-started/verify-account/verify-document/start",
      },
    ],
  },
  {
    id: "2",
    icon: DotIcon,
    title: "Complete your profile",
    text: "Fill out your ministry information and upload a profile photo to help your audience connect with you.",
    button: "Complete profile",
    action: "/get-started/complete-profile",
  },
  {
    id: "3",
    icon: DotIcon,
    title: "How to use troott",
    text: "Take a guided tour of the dashboard using Troott. It helps you discover important tools and how to use them effectively.",
    button: "Tour & Tutorial",
    action: "/get-started/tour-guide",
  },
  {
    id: "4",
    icon: DotIcon,
    title: "Upload first sermon",
    text: "Create your first sermon post with title, description, and upload your audio or video content.",
    button: "Upload sermon",
    action: "/upload-sermon",
    steps: [
      {
        id: "1",
        title: "Upload File",
        action: "/upload-sermon/file",
      },
      {
        id: "2",
        title: "Sermon Details",
        action: "/upload-sermon/details",
      },
      {
        id: "3",
        title: "Thumbnail & Preview",
        action: "/upload-sermon/thumbnail",
      },
      {
        id: "4",
        title: "Publish Settings",
        action: "/upload-sermon/publish",
      },
    ],
  },
];

export default OnboardingItems;
