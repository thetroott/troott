import { IRoute } from "@/utils/interfaces";

const sidebarRoutes: Array<IRoute> = [

    {
        name: 'dashboard',
        title: 'Dashboard',
        url: '/dashboard',
        iconName: 'layout-right',
        action: 'navigate',
        isAuth: false,
        params: [],
        content: { collapsed: false },
        subroutes: [
            {
                name: 'onboard',
                title: 'Onboard',
                iconName: 'nav',
                url: '/onboard',
                action: 'navigate',
                isAuth: false,
                params: [],
                content: { collapsed: false, backButton: true }
            },
        ]
    },
    {
        name: 'settings',
        title: 'Settings',
        iconName: 'settings',
        url: '/settings',
        action: 'open-secondary',
        isAuth: false,
        params: [],
        content: { collapsed: false },
        subroutes: [
            {
                name: 'security',
                title: 'Security',
                displayTitle: 'Security Settings',
                iconName: 'historic-shield',
                url: '/security',
                action: 'navigate',
                isAuth: false,
                params: [],
                content: { collapsed: false, backButton: true }
            },
            {
                name: 'notifications',
                title: 'Notification',
                iconName: 'bell',
                url: '/notifications',
                action: 'navigate',
                isAuth: false,
                params: [],
                content: { collapsed: false, backButton: true }
            },
            
        ]
    },
]

export default sidebarRoutes;