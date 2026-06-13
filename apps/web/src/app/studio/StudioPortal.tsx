import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '@/api/config';
import cookieService from '@/api/services/cookies';
import storage from '@/api/services/local-storage';
import { useStudio } from '@/context/studio/useStudio';
import { useSession } from '@/context/session/sessionState';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import useContextType from '@/hooks/shared/useContextType';
import type { StudioResponseDTO } from '@/dtos/studio.dto';
import { normalizeStudioCode } from '@/utils/studio-nav.util';
import { PortalRegionLoader } from '@/components/shared/studio/PortalRegionLoader';
import { StudioEmptyState } from '@/components/shared/studio/StudioEmptyState';
import { StudioPageCenter } from '@/components/shared/studio/StudioPageCenter';
import { UserType } from '@/models/User.model';
import { PATH_GET_STARTED } from '@/routes/paths';
import { isStudioContentRole } from '@/utils/roles.util';
import { isStudioOnboardingComplete } from '@/utils/portal-onboarding.util';
import { normalizeUserType } from '@/utils/auth-redirect.util';
import {
    canAccessStudioDuringOnboarding,
} from '@/utils/hub-onboarding.util';
import {
    invalidateStaleSession,
    isUnauthorizedApiStatus,
} from '@/utils/auth-session.util';

/**
 * Resolves /studio/:studioCode then renders nested studio routes via Outlet.
 */
const StudioPortal = () => {
    const { studioCode: routeCode } = useParams<{ studioCode: string }>();
    const { studio, studioCode: contextCode } = useStudio();
    const { isHydratingSession } = useSession();
    const { minister, isLoading: ministerLoading } = useMinister();
    const { creator, isLoading: creatorLoading } = useCreator();
    const { userContext } = useContextType();
    const location = useLocation();
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const raw = routeCode?.trim() ?? '';
        if (!raw) return;
        const normalized = normalizeStudioCode(raw);
        if (raw !== normalized) {
            const suffix = location.pathname.replace(/^\/studio\/[^/]+/i, '');
            navigate(
                `/studio/${normalized}${suffix}${location.search}${location.hash}`,
                { replace: true },
            );
        }
    }, [routeCode, location.pathname, location.search, location.hash, navigate]);

    useEffect(() => {
        const utEarly = normalizeUserType(
            String(
                (userContext.user as { userType?: string } | null)?.userType ??
                    cookieService.getUserType() ??
                    '',
            ),
        );
        const profileContextLoading =
            (utEarly === UserType.MINISTER && ministerLoading) ||
            (utEarly === UserType.CREATOR && creatorLoading);

        if (isHydratingSession || profileContextLoading) {
            return;
        }

        const ut = normalizeUserType(
            String(
                (userContext.user as { userType?: string } | null)?.userType ??
                    cookieService.getUserType() ??
                    '',
            ),
        );

        if (!isStudioContentRole(ut)) {
            return;
        }

        const sessionUser = userContext.user as {
            onboard?: { step?: number; status?: string };
        } | null;

        const tourSearch = new URLSearchParams(location.search).get('tour');
        const partialStudioAccess = canAccessStudioDuringOnboarding(
            location.pathname,
            ut,
            minister,
            creator,
            sessionUser,
            tourSearch,
        );

        if (
            !isStudioOnboardingComplete(ut, minister, sessionUser, creator) &&
            !partialStudioAccess
        ) {
            navigate(PATH_GET_STARTED, { replace: true });
            return;
        }
    }, [
        isHydratingSession,
        ministerLoading,
        creatorLoading,
        minister,
        creator,
        userContext.user,
        location.pathname,
        location.search,
        navigate,
    ]);

    const sessionUser = userContext.user as {
        userType?: string;
        onboard?: { step?: number; status?: string };
    } | null;
    const portalUserType = normalizeUserType(
        String(sessionUser?.userType ?? cookieService.getUserType() ?? ''),
    );
    const tourSearch = new URLSearchParams(location.search).get('tour');
    const partialStudioAccess = canAccessStudioDuringOnboarding(
        location.pathname,
        portalUserType,
        minister,
        creator,
        sessionUser,
        tourSearch,
    );
    const profileContextLoading =
        (portalUserType === UserType.MINISTER && ministerLoading) ||
        (portalUserType === UserType.CREATOR && creatorLoading);

    const onboardingComplete =
        !isHydratingSession &&
        !profileContextLoading &&
        (!isStudioContentRole(portalUserType) ||
            isStudioOnboardingComplete(
                portalUserType,
                minister,
                sessionUser,
                creator,
            ) ||
            partialStudioAccess);

    useEffect(() => {
        const segment = routeCode?.trim()
            ? normalizeStudioCode(routeCode)
            : '';
        if (!segment) {
            setError('Studio not specified');
            return;
        }

        if (!onboardingComplete) {
            return;
        }

        if (
            studio &&
            (normalizeStudioCode(contextCode) === segment ||
                normalizeStudioCode(studio.code) === segment)
        ) {
            storage.setStudioCode(studio.code);
            setReady(true);
            setError(null);
            return;
        }

        let cancelled = false;

        void (async () => {
            const res = await api.studio.getStudio(segment);
            if (cancelled) return;

            if (res.error) {
                if (isUnauthorizedApiStatus(res.status)) {
                    invalidateStaleSession();
                    return;
                }
                setError(res.message || 'Studio not found');
                return;
            }

            const loaded = res.data as StudioResponseDTO | undefined;
            if (!loaded?.code) {
                setError('Studio not found');
                return;
            }

            storage.setStudioCode(loaded.code);
            setReady(true);
        })();

        return () => {
            cancelled = true;
        };
    }, [routeCode, studio, contextCode, onboardingComplete]);

    if (error) {
        return (
            <StudioPageCenter>
                <StudioEmptyState
                    placement="page"
                    className="min-h-[40vh] text-muted-foreground"
                    description={error}
                />
            </StudioPageCenter>
        );
    }

    if (!onboardingComplete || !ready) {
        return <PortalRegionLoader label="Loading studio…" />;
    }

    return <Outlet />;
};

export default StudioPortal;
