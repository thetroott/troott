export interface SubscriptionDomainState {
    subscription: unknown;
    plan: unknown;
}

export type SubscriptionAction =
    | { type: 'GET_SUBSCRIPTION'; payload: unknown }
    | { type: 'SET_SUBSCRIPTION'; payload: unknown }
    | { type: 'SET_PLAN'; payload: unknown };
