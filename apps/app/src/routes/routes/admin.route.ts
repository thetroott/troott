import { IRoute } from "@/utils/interfaces";

const adminRoutes: Array<IRoute> = [
    {
        name: 'admin',
        title: 'Dashboard',
        url: '/admin',
        iconName: 'chart',
        action: 'navigate',
        isAuth: true,
        params: [],
        content: { collapsed: false },
    },
    {
        name: 'users',
        title: 'Users',
        url: '/admin/users',
        iconName: 'users',
        action: 'navigate',
        isAuth: true,
        params: [],
        content: { collapsed: false },
        subroutes: [
            {
                name: 'all-users',
                title: 'All Users',
                iconName: 'users',
                url: '/all-users',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false, backButton: true }
            },
            {
                name: 'talents',
                title: 'Talents',
                iconName: 'user',
                url: '/talents',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false, backButton: true }
            },
            {
                name: 'businesses',
                title: 'Businesses',
                iconName: 'buildings',
                url: '/businesses',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false, backButton: true }
            },
            {
                name: 'divider',
                url: '/',
                isAuth: true,
                params: [],
                content: {}
            },
            {
                name: 'admins',
                title: 'Admins',
                iconName: 'shield',
                url: '/admins',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false, backButton: true }
            }
        ]
    },
    {
        name: 'hackathons',
        title: 'Hackathons',
        url: '/admin/hackathons',
        iconName: 'trophy',
        action: 'navigate',
        isAuth: true,
        params: [],
        content: { collapsed: false },
        subroutes: [
            {
                name: 'admin-hackathons-list',
                title: 'All Hackathons',
                url: '/list',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },
            {
                name: 'admin-hackathons-moderate',
                title: 'Moderation',
                url: '/moderate',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            }
        ]
    },
    
    {
        name: 'admin-settings',
        title: 'System Settings',
        url: '/admin/settings',
        iconName: 'gear',
        action: 'navigate',
        isAuth: true,
        params: [],
        content: { collapsed: false },
        subroutes: [
            {
                name: 'admin-settings-general',
                title: 'General',
                url: '/general',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },
            {
                name: 'admin-settings-security',
                title: 'Security',
                iconName: 'shield',
                url: '/security',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            },
            {
                name: 'admin-settings-invitations',
                title: 'Invitations',
                iconName: 'envelope',
                url: '/invitations',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false }
            }
        ]
    },
    {
        name: 'resources',
        title: 'Resources',
        url: '/resources',
        iconName: 'folder',
        action: 'navigate',
        isAuth: true,
        params: [],
        content: { collapsed: false },
    },    {
        name: 'referrals',
        title: 'Referrals',
        iconName: 'gift',
        url: '/referrals',
        action: 'navigate',
        isAuth: true,
        params: [],
        content: { collapsed: false, backButton: true }
    },

    {
        name: 'payments',
        title: 'Payments',
        iconName: 'credit-card',
        url: '/payments',
        action: 'open-secondary',
        isAuth: true,
        params: [],
        content: { collapsed: false },
        subroutes: [
            {
                name: 'transactions',
                title: 'Transactions',
                iconName: 'chart',
                url: '/transactions',
                action: 'navigate',
                isAuth: true,
                params: [{ type: 'url', name: 'id' }],
                content: { collapsed: false, backButton: true }
            },
            {
                name: 'subscriptions',
                title: 'Subscriptions',
                iconName: 'shopping-bag',
                url: '/subscriptions',
                action: 'navigate',
                isAuth: true,
                params: [{ type: 'url', name: 'id' }],
                content: { collapsed: false, backButton: true }
            },
            {
                name: 'divider',
                url: '/',
                isAuth: true,
                params: [],
                content: {}
            }
        ]
    },

    {
        name: 'account',
        title: 'Account',
        iconName: 'user',
        url: '/account',
        action: 'open-secondary',
        isAuth: true,
        params: [],
        content: { collapsed: false },
        subroutes: [
            {
                name: 'profile',
                title: 'Profile',
                iconName: 'user',
                url: '/profile',
                action: 'navigate',
                isAuth: true,
                params: [{ type: 'url', name: 'id' }],
                content: { collapsed: false, backButton: true }
            },
            {
                name: 'preferences',
                title: 'Preferences',
                iconName: 'gear',
                url: '/preferences',
                action: 'navigate',
                isAuth: true,
                params: [{ type: 'url', name: 'id' }],
                content: { collapsed: false, backButton: true }
            },
            {
                name: 'divider',
                url: '/',
                isAuth: true,
                params: [],
                content: {}
            },
            {
                name: 'billing',
                title: 'Billing',
                iconName: 'credit-card',
                url: '/billing',
                action: 'navigate',
                isAuth: true,
                params: [{ type: 'url', name: 'id' }],
                content: { collapsed: false, backButton: true }
            }
        ]
    },

    {
        name: 'support',
        title: 'Support',
        iconName: 'lifebuoy',
        url: '/support',
        action: 'open-secondary',
        isAuth: true,
        params: [],
        content: { collapsed: false },
        subroutes: [
            {
                name: 'feedback',
                title: 'Feedback',
                iconName: 'lightbulb',
                url: '/feedback',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false, backButton: true }
            },
            {
                name: 'updates',
                title: 'Updates',
                iconName: 'bell',
                url: '/updates',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false, backButton: true }
            },
            {
                name: 'divider',
                url: '/',
                isAuth: true,
                params: [],
                content: {}
            },
            {
                name: 'help',
                title: 'Help',
                iconName: 'help',
                url: '/help',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false, backButton: true }
            }
        ]
    },
];

export default adminRoutes;