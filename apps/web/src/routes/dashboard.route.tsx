import DashboardLayout from '@/components/layouts/DashboardLayout';
import { IRoute } from '@/utils/interfaces';
import { INTERNAL_PORTAL_ROLES } from '@/utils/roles.util';
import ministerRoutes from './minister.route';
import studioRoutes from './studio.route';

/** Authenticated shell — sidebar + outlet for minister onboarding and studio. */
const dashboardRoutes: Array<IRoute> = [
    {
        name: 'dashboard',
        url: '/',
        isAuth: true,
        element: <DashboardLayout />,
        roles: INTERNAL_PORTAL_ROLES.map(String),
        subroutes: [...ministerRoutes, ...studioRoutes],
    },
];

export default dashboardRoutes;
