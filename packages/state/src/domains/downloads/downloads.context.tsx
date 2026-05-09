import { createDomainContext } from '../_shared/createDomain';
import { downloadsReducer } from './downloads.reducer';
import { downloadsInitial } from './downloads.seed';
import type { DownloadsAction, DownloadsState } from './downloads.types';

const d = createDomainContext<DownloadsState, DownloadsAction>(
    'downloads',
    downloadsReducer,
    downloadsInitial,
);

export const DownloadsProvider = d.Provider;
export const useDownloadsState = d.useState;
export const useDownloadsDispatch = d.useDispatch;
