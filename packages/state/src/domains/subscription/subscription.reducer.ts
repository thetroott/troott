import type { SubscriptionAction, SubscriptionDomainState } from './subscription.types';

export function subscriptionReducer(
    state: SubscriptionDomainState,
    action: SubscriptionAction,
): SubscriptionDomainState {
    switch (action.type) {
        case 'GET_SUBSCRIPTION':
        case 'SET_SUBSCRIPTION':
            return { ...state, subscription: action.payload };
        case 'SET_PLAN':
            return { ...state, plan: action.payload };
        default:
            return state;
    }
}
