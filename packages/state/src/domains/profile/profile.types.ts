import type { ProfileDTO } from '../../helpers/interface';

export interface ProfileDomainState {
    profile: ProfileDTO | null;
    preferences: unknown;
}

export type ProfileAction =
    | { type: 'GET_PROFILE'; payload: ProfileDTO | null }
    | { type: 'SET_PROFILE'; payload: ProfileDTO | null }
    | { type: 'GET_PREFERENCES'; payload: unknown }
    | { type: 'SET_PREFERENCES'; payload: unknown };
