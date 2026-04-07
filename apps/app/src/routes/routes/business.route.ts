import { IRoute } from "@/utils/interfaces";

const businessRoutes: Array<IRoute> = [
    {
        name: 'business',
        title: 'Business',
        url: '/b',
        iconName: 'buildings',
        action: 'open-secondary',
        isAuth: true,
        params: [],
        content: { collapsed: false },
        subroutes: [
            {
                name: 'home',
                title: 'Home',
                iconName: 'home',
                url: '/home',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },
            {
                name: 'my-inbox',
                title: 'My Inbox',
                iconName: 'inbox',
                url: '/messages',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },            {
                name: 'search',
                title: 'Search',
                iconName: 'search',
                url: '/search',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },
            {
                name: 'domains',
                title: 'Domains',
                iconName: 'domains',
                url: '/domains',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },
            {
                name: 'members',
                title: 'Members',
                iconName: 'members',
                url: '/members',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },
            {
                name: 'settings',
                title: 'Settings',
                iconName: 'settings',
                url: '/settings',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },
            {
                name: 'upgrade-plan',
                title: 'Upgrade Plan',
                iconName: 'upgrade-plan',
                url: '/upgrade-plan',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },
        ]
    },
];

export default businessRoutes;