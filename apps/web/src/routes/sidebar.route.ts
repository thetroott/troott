import { IRoute } from '@/utils/interfaces';

/** Sidebar nav metadata (not mounted by React Router). */
const sidebarRoutes: Array<IRoute> = [
    {
        name: 'nav-root',
        url: '/',
        isAuth: false,
        content: { collapsed: false },
        subroutes: [],
    },
];

export default sidebarRoutes;
