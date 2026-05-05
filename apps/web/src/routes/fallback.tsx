import Notfound from '@/app/error/NotFound';
import RouteFallback from '@/app/error/ErrorUI';
import Unauthorized from '@/app/error/Unauthorized';

export const fallbackRoutes = [
    {
        path: '/unauthorized',
        element: <Unauthorized />,
    },
    {
        path: '*',
        element: <Notfound />,
    },
    {
        path: '/route-fallback',
        element: <RouteFallback />,
    },
];
