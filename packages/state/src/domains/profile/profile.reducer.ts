import type { ProfileAction, ProfileDomainState } from './profile.types';

export function profileReducer(
    state: ProfileDomainState,
    action: ProfileAction,
): ProfileDomainState {
    switch (action.type) {
        case 'GET_PROFILE':
        case 'SET_PROFILE':
            return { ...state, profile: action.payload };
        case 'GET_PREFERENCES':
        case 'SET_PREFERENCES':
            return { ...state, preferences: action.payload };
        default:
            return state;
    }
}

