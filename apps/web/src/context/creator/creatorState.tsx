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
import type { CreatorResponseDTO } from '@/dtos/creator.dto';
import CreatorContext from './creatorContext';
import { ONBOARDING_PROFILE_REFRESH_EVENT } from '@/utils/hub-onboarding.util';
import { UserType } from '@/models/User.model';
import { normalizeUserType } from '@/utils/auth-redirect.util';

function isCreatorPortalUser(): boolean {
    return (
        normalizeUserType(cookieService.getUserType() || '') ===
        UserType.CREATOR.toLowerCase()
    );
}

function parseCreatorPayload(data: unknown): CreatorResponseDTO | null {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const raw = data as { creator?: CreatorResponseDTO } | CreatorResponseDTO;
    if ('creator' in raw && raw.creator) {
        return raw.creator;
    }
    const doc = raw as CreatorResponseDTO & { _id?: string };
    if ('_id' in doc || ('id' in doc && 'code' in doc)) {
        return {
            ...doc,
            id: doc.id ?? String(doc._id ?? ''),
        };
    }
    return null;
}

export function CreatorState({ children }: { children: ReactNode }) {
    const [creator, setCreator] = useState<CreatorResponseDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadedRef = useRef(false);

    const refresh = useCallback(async (options?: { force?: boolean }) => {
        if (!isCreatorPortalUser()) {
            setCreator(null);
            setError(null);
            loadedRef.current = false;
            return null;
        }

        if (loadedRef.current && !options?.force && creator) {
            return creator;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await api.creator.getCreator();
            if (res.error) {
                setCreator(null);
                setError(res.message || 'Failed to load creator profile');
                loadedRef.current = false;
                return null;
            }

            const parsed = parseCreatorPayload(res.data);
            setCreator(parsed);
            loadedRef.current = Boolean(parsed);
            return parsed;
        } catch (e) {
            const message =
                e instanceof Error ? e.message : 'Failed to load creator profile';
            setCreator(null);
            setError(message);
            loadedRef.current = false;
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [creator]);

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

    const creatorId = creator?.id?.trim() ?? '';

    const value = useMemo(
        () => ({
            creator,
            creatorId,
            isLoading,
            error,
            refresh,
        }),
        [creator, creatorId, isLoading, error, refresh],
    );

    return (
        <CreatorContext.Provider value={value}>
            {children}
        </CreatorContext.Provider>
    );
}

export default CreatorState;
