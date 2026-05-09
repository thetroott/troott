import { createDomainContext } from '../_shared/createDomain';
import { recommendationsReducer } from './recommendations.reducer';
import { recommendationsInitial } from './recommendations.seed';
import type { RecommendationsAction, RecommendationsState } from './recommendations.types';

const d = createDomainContext<RecommendationsState, RecommendationsAction>(
    'recommendations',
    recommendationsReducer,
    recommendationsInitial,
);

export const RecommendationsProvider = d.Provider;
export const useRecommendationsState = d.useState;
export const useRecommendationsDispatch = d.useDispatch;
