import { describe, expect, it } from 'vitest';
import { UserType } from '@/models/User.model';
import { isStudioOnboardingComplete } from './portal-onboarding.util';

describe('portal-onboarding.util', () => {
    it('treats minister onboarding complete from profile status', () => {
        expect(
            isStudioOnboardingComplete(
                UserType.MINISTER,
                { onboarding: { status: 'completed', step: 6 } } as never,
                null,
            ),
        ).toBe(true);
    });

    it('falls back to user.onboard.status for minister when profile missing', () => {
        expect(
            isStudioOnboardingComplete(
                UserType.MINISTER,
                null,
                { onboard: { status: 'completed' } },
            ),
        ).toBe(true);
    });

    it('falls back to user.onboard.status for creator when profile missing', () => {
        expect(
            isStudioOnboardingComplete(
                UserType.CREATOR,
                null,
                { onboard: { status: 'completed' } },
                null,
            ),
        ).toBe(true);
    });

    it('keeps get-started visible while onboarding is in progress', () => {
        expect(
            isStudioOnboardingComplete(
                UserType.MINISTER,
                { onboarding: { status: 'in-progress', step: 2 } } as never,
                { onboard: { status: 'in-progress' } },
            ),
        ).toBe(false);
    });
});
