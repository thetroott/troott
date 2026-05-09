import { createDomainContext } from '../_shared/createDomain';
import { preferencesReducer } from './preferences.reducer';
import { preferencesInitial } from './preferences.seed';
import type { PreferencesAction, PreferencesState } from './preferences.types';

const d = createDomainContext<PreferencesState, PreferencesAction>(
    'preferences',
    preferencesReducer,
    preferencesInitial,
);

export const PreferencesProvider = d.Provider;
export const usePreferencesState = d.useState;
export const usePreferencesDispatch = d.useDispatch;
