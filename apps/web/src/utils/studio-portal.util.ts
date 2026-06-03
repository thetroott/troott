import api from '@/api/config';
import storage from '@/api/services/local-storage';
import { PATH_GET_STARTED, studioHomePath } from '@/routes/paths';
import {
    invalidateStaleSession,
    isUnauthorizedApiStatus,
} from '@/utils/auth-session.util';

export function studioPortalPath(studioCode: string): string {
    return studioHomePath(studioCode);
}

/**
 * Navigates to /studio/{code} (studio home / Dashboard). Uses `preferredCode` when provided.
 */
export async function navigateToStudioPortal(
    goTo: (path: string) => void,
    preferredCode?: string,
): Promise<void> {
    const cached = preferredCode?.trim() || storage.getStudioCode()?.trim();
    if (cached) {
        storage.setStudioCode(cached);
        goTo(studioPortalPath(cached));
        return;
    }

    try {
        const res = await api.studio.getMyStudio();
        if (res.error && isUnauthorizedApiStatus(res.status)) {
            invalidateStaleSession();
            return;
        }
        const studio = res.data?.studio;
        const code =
            studio && typeof studio.code === 'string'
                ? studio.code.trim()
                : '';
        if (!res.error && code) {
            storage.setStudioCode(code);
            goTo(studioPortalPath(code));
            return;
        }
    } catch {
        /* fall through */
    }
    goTo(PATH_GET_STARTED);
}
