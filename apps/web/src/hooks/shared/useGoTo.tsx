import { useLocation, useNavigate } from 'react-router-dom';
import type { SyntheticEvent } from 'react';
import storage from '@/api/services/local-storage';
import useSidebarStudioCode from '@/hooks/shared/useSidebarStudioCode';
import {
    getStoredStudioCode,
    normalizeStudioCode,
    resolveStudioNavUrl,
} from '@/utils/studio-nav.util';
import { OPEN_CREATE_SERMON_STATE } from '@/constants/create-sermon-nav';
import {
    PATH_ROOT,
    PATH_STUDIO_PREFIX,
    studioSermonsListPath,
} from '@/routes/paths';

type DetailRouteTarget = { route: string; name: string };

const useGoTo = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const sidebarStudioCode = useSidebarStudioCode();

    const goTo = (url: string) => {
        if (!url) {
            return;
        }
        const target =
            resolveStudioNavUrl(url, sidebarStudioCode) ??
            resolveStudioNavUrl(url, getStoredStudioCode());
        if (target) {
            navigate(target);
        }
    };

    const toMainRoute = () => {
        navigate(PATH_ROOT);
    };

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
                const code = getStoredStudioCode();
                if (code) {
                    navigate(studioSermonsListPath(code), {
                        state: { [OPEN_CREATE_SERMON_STATE]: true },
                    });
                    return;
                }
            }
        }

        const code = getStoredStudioCode();
        if (code && storage.checkToken()) {
            navigate(`${PATH_STUDIO_PREFIX}/${normalizeStudioCode(code)}`);
            return;
        }
        navigate(PATH_ROOT);
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
