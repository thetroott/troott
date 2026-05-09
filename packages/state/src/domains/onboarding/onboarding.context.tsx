import { createDomainContext } from '../_shared/createDomain';
import { onboardingReducer } from './onboarding.reducer';
import { onboardingInitial } from './onboarding.seed';
import type { OnboardingAction, OnboardingState } from './onboarding.types';

const d = createDomainContext<OnboardingState, OnboardingAction>(
    'onboarding',
    onboardingReducer,
    onboardingInitial,
);

export const OnboardingProvider = d.Provider;
export const useOnboardingState = d.useState;
export const useOnboardingDispatch = d.useDispatch;
