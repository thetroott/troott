import { createDomainContext } from '../_shared/createDomain';
import { dataViewsReducer } from './data-views.reducer';
import { dataViewsInitial } from './data-views.seed';
import type { DataViewsAction, DataViewsState } from './data-views.types';

const dataViewsDomain = createDomainContext<DataViewsState, DataViewsAction>(
    'dataViews',
    dataViewsReducer,
    dataViewsInitial,
);

export const DataViewsProvider = dataViewsDomain.Provider;
export const useDataViewsState = dataViewsDomain.useState;
export const useDataViewsDispatch = dataViewsDomain.useDispatch;
