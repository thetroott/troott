import type { UiAction, UiDomainState } from './ui.types';

export function uiReducer(state: UiDomainState, action: UiAction): UiDomainState {
    switch (action.type) {
        case 'SET_TOAST':
            return { ...state, toast: action.payload };
        case 'SET_SIDEBAR':
            return { ...state, sidebar: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: true };
        case 'UNSET_LOADING':
            return { ...state, loading: false };
        default:
            return state;
    }
}
