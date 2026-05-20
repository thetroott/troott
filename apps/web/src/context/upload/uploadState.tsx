import React, {
    useContext,
    useEffect,
    useReducer,
    type ReactNode,
} from 'react';

import type { ISermonUpload, IUploadFormErrors } from '@/utils/interfaces.util';

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
import UploadContext from './uploadContext';
import uploadReducer from './uploadReducer';
import {
    UPLOAD_STORAGE_KEY,
    buildInitialUploadState,
    type IUploadContextValue,
} from './types';

export const uploadActions = {
    setStep: (step: string) => ({
        type: SET_STEP,
        payload: step,
    }),
    setFile: (file: File | null) => ({
        type: SET_FILE,
        payload: file,
    }),
    setUploadData: (data: Partial<ISermonUpload>) => ({
        type: SET_UPLOAD_DATA,
        payload: data,
    }),
    setErrors: (errors: IUploadFormErrors) => ({
        type: SET_ERRORS,
        payload: errors,
    }),
    setLoading: (loading: boolean) => ({
        type: SET_LOADING,
        payload: loading,
    }),
    setProgress: (progress: number) => ({
        type: SET_PROGRESS,
        payload: progress,
    }),
    setUploadComplete: (complete: boolean) => ({
        type: SET_UPLOAD_COMPLETE,
        payload: complete,
    }),
    setActiveOption: (option: string) => ({
        type: SET_ACTIVE_OPTION,
        payload: option,
    }),
    resetUpload: () => ({ type: RESET_UPLOAD }),
    loadFromStorage: (data: Partial<ISermonUpload>) => ({
        type: LOAD_FROM_STORAGE,
        payload: data,
    }),
    loadFromDraft: (data: Partial<ISermonUpload>) => ({
        type: LOAD_FROM_DRAFT,
        payload: data,
    }),
    clearStoredData: () => ({ type: CLEAR_STORED_DATA }),
};

export const useUpload = () => {
    const context = useContext(UploadContext);
    if (!context) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
};

const clearStoredData = () => {
    localStorage.removeItem(UPLOAD_STORAGE_KEY);
};

export const UploadProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(
        uploadReducer,
        undefined,
        buildInitialUploadState,
    );

    useEffect(() => {
        const saved = localStorage.getItem(UPLOAD_STORAGE_KEY);
        if (saved) {
            try {
                const parsedData = JSON.parse(saved);
                dispatch({
                    type: LOAD_FROM_STORAGE,
                    payload: parsedData,
                });
            } catch (error) {
                console.warn(
                    'Failed to load upload draft from storage:',
                    error,
                );
            }
        }
    }, []);

    useEffect(() => {
        if (state.uploadData.title || state.uploadData.description) {
            const dataToSave = {
                ...state.uploadData,
                file: null,
                thumbnail: null,
                thumbnailPreview: null,
            };
            localStorage.setItem(
                UPLOAD_STORAGE_KEY,
                JSON.stringify(dataToSave),
            );
        }
    }, [state.uploadData]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (
                !state.uploadComplete &&
                (state.uploadData.file ||
                    state.uploadData.title ||
                    state.uploadData.description)
            ) {
                clearStoredData();
                const message =
                    'You have an incomplete upload. Your progress will be lost if you leave.';
                event.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [state.uploadComplete, state.uploadData]);

    const value: IUploadContextValue = { state, dispatch };

    return (
        <UploadContext.Provider value={value}>
            {children}
        </UploadContext.Provider>
    );
};

export default UploadProvider;
