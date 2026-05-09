import { createDomainContext } from '../_shared/createDomain';
import { searchReducer } from './search.reducer';
import { searchInitial } from './search.seed';
import type { SearchAction, SearchState } from './search.types';

const d = createDomainContext<SearchState, SearchAction>(
    'search',
    searchReducer,
    searchInitial,
);

export const SearchProvider = d.Provider;
export const useSearchState = d.useState;
export const useSearchDispatch = d.useDispatch;
