import { createDomainContext } from '../_shared/createDomain';
import { libraryReducer } from './library.reducer';
import { libraryInitial } from './library.seed';
import type { LibraryAction, LibraryState } from './library.types';

const d = createDomainContext<LibraryState, LibraryAction>(
    'library',
    libraryReducer,
    libraryInitial,
);

export const LibraryProvider = d.Provider;
export const useLibraryState = d.useState;
export const useLibraryDispatch = d.useDispatch;
