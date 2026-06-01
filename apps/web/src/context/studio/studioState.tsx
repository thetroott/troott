import {
    useCallback,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import api from '@/api/config';
import storage from '@/api/services/local-storage';
import type { MyStudioResponseDTO, StudioResponseDTO } from '@/dtos/studio.dto';
import type { StudioRole } from '@/dtos/api-domain';
import StudioContext from './studioContext';
import { normalizeStudioCode } from '@/utils/studio-nav.util';

export function StudioState({ children }: { children: ReactNode }) {
    const [studio, setStudio] = useState<StudioResponseDTO | null>(null);
    const [role, setRole] = useState<StudioRole | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadedRef = useRef(false);

    const refresh = useCallback(async (options?: { force?: boolean }) => {
        if (loadedRef.current && !options?.force && studio) {
            return { studio, role };
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await api.studio.getMyStudio();
            if (res.error) {
                setStudio(null);
                setRole(null);
                setError(res.message || 'Failed to load studio');
                loadedRef.current = false;
                return { studio: null, role: null };
            }

            const payload = res.data as MyStudioResponseDTO | undefined;
            const nextStudio = payload?.studio ?? null;
            const nextRole = payload?.role ?? null;

            setStudio(nextStudio);
            setRole(nextRole);
            loadedRef.current = Boolean(nextStudio);

            if (nextStudio?.code) {
                storage.setStudioCode(nextStudio.code);
            }

            return { studio: nextStudio, role: nextRole };
        } catch (e) {
            const message =
                e instanceof Error ? e.message : 'Failed to load studio';
            setStudio(null);
            setRole(null);
            setError(message);
            loadedRef.current = false;
            return { studio: null, role: null };
        } finally {
            setIsLoading(false);
        }
    }, [studio, role]);

    const activeStudioId = studio?.id?.trim() ?? '';
    const studioCode = (() => {
        const raw = studio?.code?.trim() ?? storage.getStudioCode()?.trim() ?? '';
        return raw ? normalizeStudioCode(raw) : '';
    })();

    const value = useMemo(
        () => ({
            studio,
            role,
            activeStudioId,
            studioCode,
            isLoading,
            error,
            refresh,
        }),
        [studio, role, activeStudioId, studioCode, isLoading, error, refresh],
    );

    return (
        <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
    );
}

export default StudioState;
