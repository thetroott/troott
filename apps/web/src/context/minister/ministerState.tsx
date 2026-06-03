import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import api from '@/api/config';
import cookieService from '@/api/services/cookies';
import type { MinisterResponseDTO } from '@/dtos/minister.dto';
import MinisterContext from './ministerContext';
import { ONBOARDING_PROFILE_REFRESH_EVENT } from '@/utils/hub-onboarding.util';
import { UserType } from '@/models/User.model';
import { normalizeUserType } from '@/utils/auth-redirect.util';

function isMinisterPortalUser(): boolean {
    return (
        normalizeUserType(cookieService.getUserType() || '') ===
        UserType.MINISTER.toLowerCase()
    );
}

function parseMinisterPayload(data: unknown): MinisterResponseDTO | null {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const raw = data as { minister?: MinisterResponseDTO } | MinisterResponseDTO;
    if ('minister' in raw && raw.minister) {
        return raw.minister;
    }
    const doc = raw as MinisterResponseDTO & { _id?: string };
    if ('_id' in doc || ('id' in doc && 'code' in doc)) {
        return {
            ...doc,
            id: doc.id ?? String(doc._id ?? ''),
        };
    }
    return null;
}

export function MinisterState({ children }: { children: ReactNode }) {
    const [minister, setMinister] = useState<MinisterResponseDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadedRef = useRef(false);

    const refresh = useCallback(async (options?: { force?: boolean }) => {
        if (!isMinisterPortalUser()) {
            setMinister(null);
            setError(null);
            loadedRef.current = false;
            return null;
        }

        if (loadedRef.current && !options?.force && minister) {
            return minister;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await api.minister.getMinister();
            if (res.error) {
                setMinister(null);
                setError(res.message || 'Failed to load minister profile');
                loadedRef.current = false;
                return null;
            }

            const parsed = parseMinisterPayload(res.data);
            setMinister(parsed);
            loadedRef.current = Boolean(parsed);
            return parsed;
        } catch (e) {
            const message =
                e instanceof Error ? e.message : 'Failed to load minister profile';
            setMinister(null);
            setError(message);
            loadedRef.current = false;
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [minister]);

    useEffect(() => {
        const onRefresh = () => {
            void refresh({ force: true });
        };
        window.addEventListener(ONBOARDING_PROFILE_REFRESH_EVENT, onRefresh);
        return () => {
            window.removeEventListener(
                ONBOARDING_PROFILE_REFRESH_EVENT,
                onRefresh,
            );
        };
    }, [refresh]);

    const ministerId = minister?.id?.trim() ?? '';

    const value = useMemo(
        () => ({
            minister,
            ministerId,
            isLoading,
            error,
            refresh,
        }),
        [minister, ministerId, isLoading, error, refresh],
    );

    return (
        <MinisterContext.Provider value={value}>
            {children}
        </MinisterContext.Provider>
    );
}

export default MinisterState;
