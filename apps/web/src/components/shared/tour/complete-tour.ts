import { troottAPIClient } from '@/api/config';
import cookieService from '@/api/services/cookies';
import { UserType } from '@/models/User.model';
import { normalizeUserType } from '@/utils/auth-redirect.util';

function isCreatorPersona(): boolean {
    const ut = normalizeUserType(cookieService.getUserType() || '');
    return ut === UserType.CREATOR.toLowerCase();
}

export async function completeOnboardingTour(): Promise<{
    ok: boolean;
    message?: string;
}> {
    const api = troottAPIClient();
    const res = isCreatorPersona()
        ? await api.creator.onboardingTourComplete({})
        : await api.minister.onboardingTourComplete({});

    if (res.error) {
        return { ok: false, message: res.message };
    }

    return { ok: true };
}
