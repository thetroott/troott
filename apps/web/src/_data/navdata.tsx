import {
    PATH_ADMIN_PREFIX,
    PATH_GET_STARTED,
    PATH_PROFILE,
    PATH_SETTINGS,
    PATH_SEG_ADMIN_SERMONS,
    PATH_SEG_ADMIN_USERS,
} from '@/routes/paths';
import { UserType } from '@/models/User.model';
import { ADMIN_PORTAL_ROLES, INTERNAL_PORTAL_ROLES } from '@/utils/roles.util';
import {
    BarChart3Icon,
    CloudUploadIcon,
    Home,
    Inbox,
    LogOut,
    LucideBookAudio,
    LucideLayoutDashboard,
    MessageCircle,
    PhoneIcon,
    PlaySquare,
    RocketIcon,
    Settings,
    TrashIcon,
    UsersIcon,
    UserRound,
} from 'lucide-react';

export const navItems = {
    mainNav: [
        {
            title: 'Main',
            url: '#',
            roles: INTERNAL_PORTAL_ROLES,
            items: [
                {
                    title: 'Get Started',
                    url: PATH_GET_STARTED,
                    icon: RocketIcon,
                    roles: [UserType.MINISTER, UserType.CREATOR],
                    isActive: false,
                    showOnboarding: true,
                },
                {
                    title: 'Dashboard',
                    url: '/dashboard',
                    icon: LucideLayoutDashboard,
                    isActive: false,
                },
                {
                    title: 'Sermons',
                    url: '/sermons',
                    icon: LucideBookAudio,
                    isActive: false,
                },
                {
                    title: 'Analytics',
                    url: '/analytics',
                    icon: BarChart3Icon,
                    isActive: false,
                },
                {
                    title: 'Bin',
                    url: '/bin',
                    icon: TrashIcon,
                    isActive: false,
                },
                {
                    title: 'Profile',
                    url: PATH_PROFILE,
                    icon: UserRound,
                    isActive: false,
                },
                {
                    title: 'Settings',
                    url: PATH_SETTINGS,
                    icon: Settings,
                    isActive: false,
                },
            ],
        },
        {
            title: 'Admin',
            url: '#',
            roles: ADMIN_PORTAL_ROLES,
            items: [
                {
                    title: 'Users',
                    url: `${PATH_ADMIN_PREFIX}/${PATH_SEG_ADMIN_USERS}`,
                    icon: UsersIcon,
                    isActive: false,
                },
                {
                    title: 'Sermons',
                    url: `${PATH_ADMIN_PREFIX}/${PATH_SEG_ADMIN_SERMONS}`,
                    icon: LucideBookAudio,
                    isActive: false,
                },
            ],
        },
    ],
    sermonNav: [
        {
            title: 'Sermon Management',
            roles: INTERNAL_PORTAL_ROLES,
            url: '#',
            items: [
                // {
                //   title: "My Sermon",
                //   url: "/get-sermons",
                //   icon: LucideBookAudio,
                //   isActive: false,
                // },
                // {
                //   title: "Series",
                //   url: "/my-series",
                //   icon: PlaySquare,
                //   isActive: false,
                // },
                // {
                //   title: "Trash",
                //   url: "/my-trash",
                //   icon: TrashIcon,
                //   isActive: false,
                // },
            ],
        },
    ],
    engagementNav: [
        {
            title: 'Engagement and analytics',
            url: '#',
            roles: INTERNAL_PORTAL_ROLES,
            items: [
                // {
                //   title: "Sermon Analytics",
                //   url: "/my-analytics",
                //   icon: BarChart3Icon,
                //   isActive: false,
                // },
                // {
                //   title: "Comments & Feedback",
                //   url: "#",
                //   icon: MessageCircle,
                //   isActive: false,
                // },
            ],
        },
    ],
};

export const navMainItems = {
    title: 'Main',
    url: '#',
    items: [
        {
            title: 'Dashboard',
            url: '#',
            icon: Home,
        },
        {
            title: 'Upload Sermon',
            url: '#',
            icon: Inbox,
        },
    ],
};

export const navSermonItems = {
    title: 'Sermon Management',
    url: '#',
    items: [
        {
            title: 'My Sermon',
            url: '#',
            icon: Home,
        },
        {
            title: 'Series',
            url: '#',
            icon: Inbox,
        },
        {
            title: 'Series',
            url: '#',
            icon: Inbox,
        },
    ],
};

export const navDataItems = {
    title: 'Engagement & Analytics',
    url: '#',
    items: [
        {
            title: 'Sermon Analytics',
            url: '#',
            icon: Home,
        },
        {
            title: 'Comments & Feedback',
            url: '#',
            icon: Inbox,
        },
    ],
};

export const navFooterItems = [
    {
        title: 'Logout',
        url: '#',
        icon: LogOut,
    },
    {
        title: 'Install Troott on',
        url: '#',
        icon: PhoneIcon,
    },
];
