import { createDomainContext } from '../_shared/createDomain';
import { profileReducer } from './profile.reducer';
import { profileInitial } from './profile.seed';
import type { ProfileAction, ProfileDomainState } from './profile.types';

const profileDomain = createDomainContext<ProfileDomainState, ProfileAction>(
    'profile',
    profileReducer,
    profileInitial,
);

export const ProfileProvider = profileDomain.Provider;
export const useProfileState = profileDomain.useState;
export const useProfileDispatch = profileDomain.useDispatch;
