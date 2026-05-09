import { createDomainContext } from '../_shared/createDomain';
import { billingReducer } from './billing.reducer';
import { billingInitial } from './billing.seed';
import type { BillingAction, BillingState } from './billing.types';

const d = createDomainContext<BillingState, BillingAction>(
    'billing',
    billingReducer,
    billingInitial,
);

export const BillingProvider = d.Provider;
export const useBillingState = d.useState;
export const useBillingDispatch = d.useDispatch;
