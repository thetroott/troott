import { createDomainContext } from '../_shared/createDomain';
import { experimentsReducer } from './experiments.reducer';
import { experimentsInitial } from './experiments.seed';
import type { ExperimentsAction, ExperimentsState } from './experiments.types';

const d = createDomainContext<ExperimentsState, ExperimentsAction>(
    'experiments',
    experimentsReducer,
    experimentsInitial,
);

export const ExperimentsProvider = d.Provider;
export const useExperimentsState = d.useState;
export const useExperimentsDispatch = d.useDispatch;
