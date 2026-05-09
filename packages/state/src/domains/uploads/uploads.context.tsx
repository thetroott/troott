import { createDomainContext } from '../_shared/createDomain';
import { uploadsReducer } from './uploads.reducer';
import { uploadsInitial } from './uploads.seed';
import type { UploadsAction, UploadsState } from './uploads.types';

const d = createDomainContext<UploadsState, UploadsAction>(
    'uploads',
    uploadsReducer,
    uploadsInitial,
);

export const UploadsProvider = d.Provider;
export const useUploadsState = d.useState;
export const useUploadsDispatch = d.useDispatch;
