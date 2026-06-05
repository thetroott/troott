import {
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import api from '@/api/config';
import storage from '@/api/services/local-storage';
import cookieService from '@/api/services/cookies';
import type { MapRegisteredUserDTO } from '@/dtos/auth.dto';
import {
    SET_IS_ADMIN,
    SET_IS_SUPER,
    SET_USER,
} from '@/context/types';
import useContextType from '@/hooks/shared/useContextType';
import {
    isAdminPortalRole,
    isStudioContentRole,
    normalizePortalUserType,
} from '@/utils/roles.util';
import { UserType } from '@/models/User.model';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import { useStudio } from '@/context/studio/useStudio';
import { useAdmin } from '@/context/admin/useAdmin';
import SessionContext from './sessionContext';
import {
    invalidateStaleSession,
    isUnauthorizedApiStatus,
} from '@/utils/auth-session.util';

function normalizeUserType(raw: string): string {
    return String(raw || '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-');
}

function parseSessionUser(data: unknown): MapRegisteredUserDTO | null {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const raw = data as { user?: MapRegisteredUserDTO } | MapRegisteredUserDTO;
    if ('user' in raw && raw.user && typeof raw.user === 'object') {
        return raw.user;
    }
    if ('id' in raw && 'email' in raw) {
        return raw as MapRegisteredUserDTO;
    }
    return null;
}

export function SessionState({ children }: { children: ReactNode }) {
    const { userContext } = useContextType();
    const ministerCtx = useMinister();
    const creatorCtx = useCreator();
    const studioCtx = useStudio();
    const adminCtx = useAdmin();
    const [isHydratingSession, setIsHydratingSession] = useState(false);
    const inFlightRef = useRef<Promise<void> | null>(null);

    const refreshSession = useCallback(
        async (options?: { force?: boolean }) => {
            if (!storage.checkToken() || !storage.checkUserID()) {
                setIsHydratingSession(false);
                return;
            }

            if (inFlightRef.current && !options?.force) {
                await inFlightRef.current;
                return;
            }

            const run = async () => {
                setIsHydratingSession(true);
                try {
                    const res = await api.auth.fetchMe();
                    if (res.error) {
                        if (isUnauthorizedApiStatus(res.status)) {
                            invalidateStaleSession();
                        }
                        return;
                    }

                    const sessionUser = parseSessionUser(res.data);
                    if (!sessionUser) {
                        return;
                    }

                    userContext.setResource(SET_USER, sessionUser);
                    const ut = String(sessionUser.userType || '');
                    userContext.setUserType(ut);
                    cookieService.setData({
                        key: 'userType',
                        payload: ut,
                        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        path: '/',
                    });

                    userContext.setResource(
                        SET_IS_SUPER,
                        Boolean(sessionUser.isSuper),
                    );
                    userContext.setResource(
                        SET_IS_ADMIN,
                        Boolean(sessionUser.isAdmin),
                    );

                    const normalized = normalizeUserType(ut);

                    const hydrateStudioPersonas = async () => {
                        if (sessionUser.isMinister) {
                            await ministerCtx.refresh({ force: true });
                        }
                        if (sessionUser.isCreator) {
                            await creatorCtx.refresh({ force: true });
                        }
                        const portalUt = normalizePortalUserType(ut);
                        const needsStudio =
                            isStudioContentRole(portalUt) ||
                            Boolean(sessionUser.studioCode) ||
                            sessionUser.isMinister ||
                            sessionUser.isCreator;
                        if (needsStudio) {
                            await studioCtx.refresh({ force: true });
                        }
                        if (sessionUser.studioCode) {
                            storage.setStudioCode(sessionUser.studioCode);
                        }
                    };

                    if (isAdminPortalRole(normalized)) {
                        await adminCtx.refreshProfile({ force: true });
                        if (
                            sessionUser.isSuper ||
                            normalizePortalUserType(ut) === UserType.SUPER
                        ) {
                            await hydrateStudioPersonas();
                        }
                        return;
                    }

                    const isMinisterUser =
                        normalized === UserType.MINISTER.toLowerCase() ||
                        Boolean(sessionUser.isMinister);

                    if (isMinisterUser) {
                        await ministerCtx.refresh({ force: true });
                    }

                    const isCreatorUser =
                        normalized === UserType.CREATOR.toLowerCase() ||
                        Boolean(sessionUser.isCreator);

                    if (isCreatorUser) {
                        await creatorCtx.refresh({ force: true });
                    }

                    if (isStudioContentRole(normalized)) {
                        await studioCtx.refresh({ force: true });
                    }

                    if (sessionUser.studioCode) {
                        storage.setStudioCode(sessionUser.studioCode);
                    }
                } finally {
                    setIsHydratingSession(false);
                }
            };

            const promise = run();
            inFlightRef.current = promise;
            try {
                await promise;
            } finally {
                inFlightRef.current = null;
            }
        },
        [userContext, ministerCtx, creatorCtx, studioCtx, adminCtx],
    );

    const value = useMemo(
        () => ({
            isHydratingSession,
            refreshSession,
        }),
        [isHydratingSession, refreshSession],
    );

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) {
        throw new Error('useSession must be used within SessionState');
    }
    return ctx;
}

export default SessionState;
