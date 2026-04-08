import { IRoute } from "@/utils/interfaces";

const productRoutes: Array<IRoute> = [

    {
        name: 'product',
        title: 'Product',
        url: '',
        iconName: 'layout-right',
        action: 'navigate',
        isAuth: true,
        params: [],
        content: { collapsed: false },
        subroutes: [
                {
                    name: 'templates',
                    title: 'Templates',
                    iconName: 'templates',
                    url: '/templates',
                    action: 'navigate',
                    isAuth: true,
                    params: [],
                    content: { collapsed: false, backButton: true }
                },
                {
                    name: 'whats-new',
                    title: "What's new",
                    iconName: 'whats-new',
                    url: '/whats-new',
                    action: 'navigate',
                    isAuth: true,
                    params: [],
                    content: { collapsed: false, backButton: true }
                },
                {
                    name: 'roadmap',
                    title: 'Roadmap',
                    iconName: 'roadmap',
                    url: '/roadmap',
                    action: 'navigate',
                    isAuth: true,
                    params: [],
                    content: { collapsed: false, backButton: true }
                },
                {
                    name: 'feature-requests',
                    title: 'Feature Requests',
                    iconName: 'feature-requests',
                    url: '/feature-requests',
                    action: 'navigate',
                    isAuth: true,
                    params: [],
                    content: { collapsed: false, backButton: true }
                },
        ]
    },
]

export default productRoutes;