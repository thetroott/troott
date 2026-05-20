import { useLocation, useNavigate } from 'react-router-dom';
import type { SyntheticEvent } from 'react';

type DetailRouteTarget = { route: string; name: string };

const useGoTo = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const goTo = (url: string) => {
        if (url) {
            navigate(url);
        }
    };

    const toMainRoute = () => {
        navigate('/');
    };

    /**
     * Legacy “create resource” entry from admin-style layouts: maps to Troott routes.
     */
    const toDetailRoute = (
        e: SyntheticEvent | null,
        target: DetailRouteTarget,
    ) => {
        if (e) {
            e.preventDefault();
        }

        if (
            target.route === 'core' &&
            typeof target.name === 'string' &&
            target.name.startsWith('create-')
        ) {
            const subtype = target.name.replace(/^create-/, '');
            if (subtype.includes('sermon') || subtype.includes('audio')) {
                navigate('/upload-sermon');
                return;
            }
        }

        navigate('/dashboard');
    };

    return {
        location,
        navigate,
        goTo,
        toMainRoute,
        toDetailRoute,
    };
};

export default useGoTo;
