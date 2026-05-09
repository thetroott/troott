import { createDomainContext } from '../_shared/createDomain';
import { socialReducer } from './social.reducer';
import { socialInitial } from './social.seed';
import type { SocialAction, SocialState } from './social.types';

const d = createDomainContext<SocialState, SocialAction>(
    'social',
    socialReducer,
    socialInitial,
);

export const SocialProvider = d.Provider;
export const useSocialState = d.useState;
export const useSocialDispatch = d.useDispatch;
