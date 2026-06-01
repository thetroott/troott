import AdminHome from '@/app/admin/AdminHome';
import AdminUsers from '@/app/admin/AdminUsers';
import AdminSermons from '@/app/admin/AdminSermons';
import AdminSermonsByMinister from '@/app/admin/AdminSermonsByMinister';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { IRoute } from '@/utils/interfaces';
import { ADMIN_PORTAL_ROLES } from '@/utils/roles.util';
import {
    PATH_ADMIN_PREFIX,
    PATH_SEG_ADMIN_SERMONS,
    PATH_SEG_ADMIN_SERMONS_BY_MINISTER,
    PATH_SEG_ADMIN_USERS,
} from './paths';

const adminRoleAllowList = ADMIN_PORTAL_ROLES.map(String);

const adminRoutes: Array<IRoute> = [
    {
        name: 'admin',
        url: PATH_ADMIN_PREFIX,
        isAuth: true,
        path: PATH_ADMIN_PREFIX,
        roles: adminRoleAllowList,
        element: <DashboardLayout />,
        subroutes: [
            {
                name: 'admin-home',
                url: PATH_ADMIN_PREFIX,
                isAuth: true,
                roles: adminRoleAllowList,
                index: true,
                element: <AdminHome />,
            },
            {
                name: 'admin-users',
                url: `${PATH_ADMIN_PREFIX}/${PATH_SEG_ADMIN_USERS}`,
                isAuth: true,
                roles: adminRoleAllowList,
                path: PATH_SEG_ADMIN_USERS,
                element: <AdminUsers />,
            },
            {
                name: 'admin-sermons',
                url: `${PATH_ADMIN_PREFIX}/${PATH_SEG_ADMIN_SERMONS}`,
                isAuth: true,
                roles: adminRoleAllowList,
                path: PATH_SEG_ADMIN_SERMONS,
                element: <AdminSermons />,
            },
            {
                name: 'admin-sermons-minister',
                url: `${PATH_ADMIN_PREFIX}/${PATH_SEG_ADMIN_SERMONS_BY_MINISTER}`,
                isAuth: true,
                roles: adminRoleAllowList,
                path: PATH_SEG_ADMIN_SERMONS_BY_MINISTER,
                element: <AdminSermonsByMinister />,
            },
        ],
    },
];

export default adminRoutes;
