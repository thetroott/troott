import api from '@/api/config';
import storage from '@/api/services/local-storage';
import { UserType } from '@/models/User.model';

export function isStudioPortalUserType(
    userType: string | null | undefined,
): boolean {
    return userType === UserType.MINISTER || userType === UserType.CREATOR;
}

/**
 * Fetches primary studio from GET /studios/me and navigates to /studio/{code}.
 */
export async function navigateToStudioPortal(
    goTo: (path: string) => void,
): Promise<void> {
    try {
        const res = await api.studio.getMyStudio();
        const studio = res.data?.studio;
        const code =
            studio && typeof studio.code === 'string'
                ? studio.code.trim()
                : '';
        if (!res.error && code) {
            storage.setStudioCode(code);
            goTo(`/studio/${code}`);
            return;
        }
    } catch {
        /* use dashboard fallback */
    }
    goTo('/dashboard');
}
