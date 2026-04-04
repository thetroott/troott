import { IRoute } from "@/utils/interfaces";

const talentRoutes: Array<IRoute> = [
    {
        name: 'talent',
        title: 'Talent',
        url: '/t',
        iconName: 'user',
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
            },
            {
                name: 'workshops',
                title: 'Workshops',
                iconName: 'workshops',
                url: '/workshops',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },
            {
                name: 'challenges',
                title: 'Challenges',
                iconName: 'challenges',
                url: '/challenges',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },
            {
                name: 'mentors',
                title: 'Mentors',
                iconName: 'mentors',
                url: '/mentors',
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

export default talentRoutes;
