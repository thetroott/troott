import { useContext, useEffect, useMemo } from 'react';
import storage from '@/api/services/local-storage';
import { useLocation, useParams } from 'react-router-dom';
import useContextType from '@/hooks/shared/useContextType';
import StudioContext from '@/context/studio/studioContext';
import {
    getStoredStudioCode,
    parseRouteStudioCode,
    pickSidebarStudioCode,
} from '@/utils/studio-nav.util';

/** Resolved studio public code for sidebar links (feat-0004). */
export function useSidebarStudioCode(): string {
    const { pathname } = useLocation();
    const params = useParams<{ studioCode?: string }>();
    const { userContext } = useContextType();
    const studioCtx = useContext(StudioContext);

    const user = userContext.user as { studioCode?: string | null } | null;

    const code = useMemo(
        () =>
            pickSidebarStudioCode({
                routeCode:
                    params.studioCode?.trim() ||
                    parseRouteStudioCode(pathname),
                sessionCode: user?.studioCode?.trim() ?? '',
                contextCode: studioCtx?.studioCode?.trim() ?? '',
                storedCode: getStoredStudioCode(),
            }),
        [
            pathname,
            params.studioCode,
            user?.studioCode,
            studioCtx?.studioCode,
        ],
    );

    useEffect(() => {
        if (code) {
            storage.setStudioCode(code);
        }
    }, [code]);

    return code;
}

export default useSidebarStudioCode;
