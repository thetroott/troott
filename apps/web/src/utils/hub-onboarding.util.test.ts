import { describe, expect, it } from 'vitest';
import { UserType } from '@/models/User.model';
import {
    canAccessStudioDuringOnboarding,
    hubCompletedItemIds,
    isStudioUploadNavHref,
    resolveOnboardingStep,
    shouldRedirectStudioNavForOnboarding,
} from './hub-onboarding.util';

describe('hub-onboarding.util', () => {
    it('maps onboarding step to hub completed ids', () => {
        expect(hubCompletedItemIds(0)).toEqual([]);
        expect(hubCompletedItemIds(2)).toEqual(['1']);
        expect(hubCompletedItemIds(4)).toEqual(['1', '2']);
        expect(hubCompletedItemIds(5)).toEqual(['1', '2', '3']);
        expect(hubCompletedItemIds(6)).toEqual(['1', '2', '3', '4']);
    });

    it('reads minister onboarding step', () => {
        expect(
            resolveOnboardingStep(
                UserType.MINISTER,
                { onboarding: { step: 3, status: 'in-progress' } } as never,
                null,
                null,
            ),
        ).toBe(3);
    });

    it('falls back to user onboard step for minister', () => {
        expect(
            resolveOnboardingStep(
                UserType.MINISTER,
                null,
                null,
                { onboard: { step: 2, status: 'in-progress' } },
            ),
        ).toBe(2);
    });

    it('detects studio upload nav hrefs', () => {
        expect(
            isStudioUploadNavHref('/studio/abc/sermons/upload/file'),
        ).toBe(true);
        expect(isStudioUploadNavHref('/studio/abc/sermons')).toBe(false);
    });

    it('redirects studio nav when onboarding incomplete before tour', () => {
        expect(
            shouldRedirectStudioNavForOnboarding(
                '/studio/abc/sermons',
                UserType.MINISTER,
                { onboarding: { step: 2, status: 'in-progress' } } as never,
                null,
            ),
        ).toBe(true);
    });

    it('allows upload nav after tour step when still incomplete', () => {
        expect(
            shouldRedirectStudioNavForOnboarding(
                '/studio/abc/sermons/upload',
                UserType.MINISTER,
                { onboarding: { step: 5, status: 'in-progress' } } as never,
                null,
            ),
        ).toBe(false);
    });

    it('allows studio home during tour onboarding window', () => {
        expect(
            canAccessStudioDuringOnboarding(
                '/studio/abc',
                UserType.MINISTER,
                { onboarding: { step: 4, status: 'in-progress' } } as never,
                null,
                null,
                null,
            ),
        ).toBe(true);
        expect(
            shouldRedirectStudioNavForOnboarding(
                '/studio/abc',
                UserType.MINISTER,
                { onboarding: { step: 4, status: 'in-progress' } } as never,
                null,
            ),
        ).toBe(false);
    });

    it('allows studio home when tour launch is pending', () => {
        expect(
            canAccessStudioDuringOnboarding(
                '/studio/abc',
                UserType.MINISTER,
                { onboarding: { step: 2, status: 'in-progress' } } as never,
                null,
                null,
                '1',
            ),
        ).toBe(true);
    });
});
