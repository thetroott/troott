import type { Dispatch } from 'react';

import type { ISermonUpload } from '@/utils/interfaces.util';
import {
    ADD_DRAFT,
    CLEAR_ERROR,
    DELETE_DRAFT,
    SET_DRAFTS,
    SET_ERROR,
    SET_LOADING,
    SET_SELECTED_DRAFT,
    UPDATE_DRAFT,
} from '../types';

export interface IDraft extends ISermonUpload {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type DraftReducerState = {
    drafts: IDraft[];
    isLoading: boolean;
    error: string | null;
    selectedDraft: IDraft | null;
};

export type DraftAction =
    | { type: typeof SET_DRAFTS; payload: IDraft[] }
    | { type: typeof SET_LOADING; payload: boolean }
    | { type: typeof SET_ERROR; payload: string | null }
    | { type: typeof ADD_DRAFT; payload: IDraft }
    | { type: typeof UPDATE_DRAFT; payload: IDraft }
    | { type: typeof DELETE_DRAFT; payload: string }
    | { type: typeof SET_SELECTED_DRAFT; payload: IDraft | null }
    | { type: typeof CLEAR_ERROR };

export interface IDraftContextValue {
    state: DraftReducerState;
    dispatch: Dispatch<DraftAction>;
    fetchDrafts: () => Promise<void>;
    saveDraft: (draft: Partial<IDraft>) => Promise<IDraft>;
    updateDraft: (draftId: string, draft: Partial<IDraft>) => Promise<IDraft>;
    deleteDraft: (draftId: string) => Promise<void>;
    loadDraftForUpload: (draft: IDraft) => void;
}
