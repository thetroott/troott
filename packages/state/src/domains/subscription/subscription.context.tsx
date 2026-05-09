import type { SubscriptionDomainState } from './subscription.types';
import { createDomainContext } from '../_shared/createDomain';
import { subscriptionReducer } from './subscription.reducer';
import { subscriptionInitial } from './subscription.seed';
import type { SubscriptionAction } from './subscription.types';

const subscriptionDomain = createDomainContext<
    SubscriptionDomainState,
    SubscriptionAction
>('subscription', subscriptionReducer, subscriptionInitial);

export const SubscriptionProvider = subscriptionDomain.Provider;
export const useSubscriptionState = subscriptionDomain.useState;
export const useSubscriptionDispatch = subscriptionDomain.useDispatch;
