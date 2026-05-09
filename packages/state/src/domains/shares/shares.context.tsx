import { createDomainContext } from '../_shared/createDomain';
import { sharesReducer } from './shares.reducer';
import { sharesInitial } from './shares.seed';
import type { SharesAction, SharesState } from './shares.types';

const d = createDomainContext<SharesState, SharesAction>(
    'shares',
    sharesReducer,
    sharesInitial,
);

export const SharesProvider = d.Provider;
export const useSharesState = d.useState;
export const useSharesDispatch = d.useDispatch;
