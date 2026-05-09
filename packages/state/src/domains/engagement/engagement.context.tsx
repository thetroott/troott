import { createDomainContext } from '../_shared/createDomain';
import { engagementReducer } from './engagement.reducer';
import { engagementInitial } from './engagement.seed';
import type { EngagementAction, EngagementState } from './engagement.types';

const d = createDomainContext<EngagementState, EngagementAction>(
    'engagement',
    engagementReducer,
    engagementInitial,
);

export const EngagementProvider = d.Provider;
export const useEngagementState = d.useState;
export const useEngagementDispatch = d.useDispatch;
