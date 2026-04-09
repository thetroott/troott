import {
  BarChart3Icon,
  CloudUploadIcon,
  FolderEdit,
  Home,
  Inbox,
  LogOut,
  LucideBookAudio,
  LucideLayoutDashboard,
  MessageCircle,
  PhoneIcon,
  PlaySquare,
  RocketIcon,
  TrashIcon,
} from "lucide-react";

export const navItems = {
  mainNav: [
    {
      title: "Main",
      url: "#",
      roles: ["staff", "minister"],
      items: [
        {
          title: "Get Started",
          url: "/get-started",
          icon: RocketIcon,
          roles: ["staff", "minister"],
          isActive: false,
          showOnboarding: true,
        },
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LucideLayoutDashboard,
          isActive: false,
        },
        {
          title: "Upload Sermon",
          url: "/upload-sermon",
          icon: CloudUploadIcon,
          isActive: true,
        },
      ],
    },
  ],
  sermonNav: [
    {
      title: "Sermon Management",
      roles: ["staff", "minister"],
      url: "#",
      items: [
        {
          title: "My Sermon",
          url: "/get-sermons",
          icon: LucideBookAudio,
          isActive: false,
        },
        {
          title: "Series",
          url: "/my-series",
          icon: PlaySquare,
          isActive: false,
        },
        {
          title: "Drafts",
          url: "/user-drafts",
          icon: FolderEdit,
          isActive: false,
        },
        {
          title: "Trash",
          url: "/my-trash",
          icon: TrashIcon,
          isActive: false,
        },
      ],
    },
  ],
  engagementNav: [
    {
      title: "Engagement & Analytics",
      url: "#",
      roles: ["staff", "minister"],
      items: [
        {
          title: "Sermon Analytics",
          url: "/my-analytics",
          icon: BarChart3Icon,
          isActive: false,
        },
        {
          title: "Comments & Feedback",
          url: "#",
          icon: MessageCircle,
          isActive: false,
        },
      ],
    },
  ],
};

export const navMainItems = {
  title: "Main",
  url: "#",
  items: [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
    },
    {
      title: "Upload Sermon",
      url: "#",
      icon: Inbox,
    },
  ],
};

export const navSermonItems = {
  title: "Sermon Management",
  url: "#",
  items: [
    {
      title: "My Sermon",
      url: "#",
      icon: Home,
    },
    {
      title: "Series",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Series",
      url: "#",
      icon: Inbox,
    },
  ],
};

export const navDataItems = {
  title: "Engagement & Analytics",
  url: "#",
  items: [
    {
      title: "Sermon Analytics",
      url: "#",
      icon: Home,
    },
    {
      title: "Comments & Feedback",
      url: "#",
      icon: Inbox,
    },
  ],
};

export const navFooterItems = [
  {
    title: "Logout",
    url: "#",
    icon: LogOut,
  },
  {
    title: "Install Troott on",
    url: "#",
    icon: PhoneIcon,
  },
];
