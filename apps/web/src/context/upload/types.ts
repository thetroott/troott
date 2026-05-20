import type { Dispatch } from 'react';

import type {
    IUploadContext,
    ISermonUpload,
    IUploadFormErrors,
} from '@/utils/interfaces.util';
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

export type UploadAction =
    | { type: typeof SET_STEP; payload: string }
    | { type: typeof SET_FILE; payload: File | null }
    | { type: typeof SET_UPLOAD_DATA; payload: Partial<ISermonUpload> }
    | { type: typeof SET_ERRORS; payload: IUploadFormErrors }
    | { type: typeof SET_LOADING; payload: boolean }
    | { type: typeof SET_PROGRESS; payload: number }
    | { type: typeof SET_UPLOAD_COMPLETE; payload: boolean }
    | { type: typeof SET_ACTIVE_OPTION; payload: string }
    | { type: typeof RESET_UPLOAD }
    | { type: typeof LOAD_FROM_STORAGE; payload: Partial<ISermonUpload> }
    | { type: typeof LOAD_FROM_DRAFT; payload: Partial<ISermonUpload> }
    | { type: typeof CLEAR_STORED_DATA };

export type UploadDispatch = Dispatch<UploadAction>;

export const UPLOAD_STORAGE_KEY = 'sermon_upload_draft';

export const initialUploadData: ISermonUpload = {
    file: null,
    title: '',
    description: '',
    category: '',
    tags: [],
    thumbnail: null,
    thumbnailPreview: null,
    isPublic: undefined,
};

export const buildInitialUploadState = (): IUploadContext => ({
    currentStep: 'file',
    uploadData: { ...initialUploadData },
    errors: {},
    isLoading: false,
    progress: 0,
    uploadComplete: false,
    activeOption: 'upload',
});

export interface IUploadContextValue {
    state: IUploadContext;
    dispatch: UploadDispatch;
}
