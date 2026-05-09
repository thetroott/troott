import type { OnboardingState } from './onboarding.types';

export const onboardingInitial: OnboardingState = {
    account: {
        step: null,
        status: null,
        completedAt: null,
        documents: [],
    },
    taste: {
        complete: false,
        selectedGenreIds: [],
        selectedArtistIds: [],
        selectedMinisterIds: [],
        profile: null,
    },
};
