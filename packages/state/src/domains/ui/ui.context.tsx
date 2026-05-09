import type { UiDomainState } from './ui.types';
import { createDomainContext } from '../_shared/createDomain';
import { uiReducer } from './ui.reducer';
import { uiInitial } from './ui.seed';
import type { UiAction } from './ui.types';

const uiDomain = createDomainContext<UiDomainState, UiAction>(
    'ui',
    uiReducer,
    uiInitial,
);

export const UiProvider = uiDomain.Provider;
export const useUiState = uiDomain.useState;
export const useUiDispatch = uiDomain.useDispatch;
