import { createDomainContext } from '../_shared/createDomain';
import { entitiesReducer } from './entities.reducer';
import { entitiesInitial } from './entities.seed';
import type { EntitiesAction, EntitiesState } from './entities.types';

const d = createDomainContext<EntitiesState, EntitiesAction>(
    'entities',
    entitiesReducer,
    entitiesInitial,
);

export const EntitiesProvider = d.Provider;
export const useEntitiesState = d.useState;
export const useEntitiesDispatch = d.useDispatch;
