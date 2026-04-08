import { IRoute } from "@/utils/interfaces";

const helpRoutes: Array<IRoute> = [

    {
        name: 'help',
        title: 'Help',
        url: '/help',
        iconName: 'layout-right',
        action: 'navigate',
        isAuth: true,
        params: [],
        content: { collapsed: false },
        subroutes: [
            {
                name: 'get-started',
                title: 'Get Started',
                iconName: 'get-started',
                url: '/get-started',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false, backButton: true }
            },
            {
                name: 'how-to-guides',
                title: 'How to Guides',
                iconName: 'how-to-guides',
                url: '/how-to-guides',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false, backButton: true }
            },            {
                name: 'Help Center',
                title: 'Help Center',
                iconName: 'help-center',
                url: '/help-center',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false, backButton: true }
            },            {
                name: 'trash',
                title: 'Trash',
                iconName: 'trash',
                url: '/trash',
                action: 'navigate',
                isAuth: true,
                params: [],
                content: { collapsed: false, backButton: true }
            },
        ]
    },
]

export default helpRoutes;