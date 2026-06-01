import type { IUploadContext } from '@/utils/interfaces.util';
import {
    CLEAR_STORED_DATA,
    LOAD_FROM_DRAFT,
    LOAD_FROM_STORAGE,
    RESET_UPLOAD,
    SET_ACTIVE_OPTION,
    SET_ERRORS,
    SET_FILE,
    SET_LOADING,
    SET_PROGRESS,
    SET_STEP,
    SET_UPLOAD_COMPLETE,
    SET_UPLOAD_DATA,
} from '../types';

import {
    UPLOAD_STORAGE_KEY,
    buildInitialUploadState,
    type UploadAction,
} from './types';

const clearStoredData = () => {
    localStorage.removeItem(UPLOAD_STORAGE_KEY);
};

const uploadReducer = (
    state: IUploadContext,
    action: UploadAction,
): IUploadContext => {
    switch (action.type) {
        case SET_STEP:
            return { ...state, currentStep: action.payload };
        case SET_FILE:
            return {
                ...state,
                uploadData: { ...state.uploadData, file: action.payload },
                errors: { ...state.errors, file: undefined },
                progress: action.payload ? 0 : state.progress,
                uploadComplete: action.payload ? false : state.uploadComplete,
            };
        case SET_UPLOAD_DATA:
            return {
                ...state,
                uploadData: { ...state.uploadData, ...action.payload },
            };
        case SET_ERRORS:
            return { ...state, errors: action.payload };
        case SET_LOADING:
            return { ...state, isLoading: action.payload };
        case SET_PROGRESS:
            return { ...state, progress: action.payload };
        case SET_UPLOAD_COMPLETE:
            return { ...state, uploadComplete: action.payload };
        case SET_ACTIVE_OPTION:
            return { ...state, activeOption: action.payload };
        case RESET_UPLOAD:
            return buildInitialUploadState();
        case LOAD_FROM_STORAGE: {
            const { file: _storedFile, ...draftFields } = action.payload;
            return {
                ...state,
                uploadData: {
                    ...state.uploadData,
                    ...draftFields,
                },
                progress: 0,
                uploadComplete: false,
            };
        }
        case LOAD_FROM_DRAFT:
            return {
                ...state,
                uploadData: { ...state.uploadData, ...action.payload },
                currentStep: 'details',
                progress: 0,
                uploadComplete: false,
            };
        case CLEAR_STORED_DATA:
            clearStoredData();
            return state;
        default:
            return state;
    }
};

export default uploadReducer;
