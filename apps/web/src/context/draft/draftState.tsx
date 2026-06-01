import React, {
    useCallback,
    useContext,
    useMemo,
    useReducer,
    type ReactNode,
} from 'react';

import api from '@/api/config';
import {
    CLEAR_ERROR,
    DELETE_DRAFT,
    SET_DRAFTS,
    SET_ERROR,
    SET_LOADING,
    SET_SELECTED_DRAFT,
    UPDATE_DRAFT,
} from '../types';
import type { DraftAction, IDraft, IDraftContextValue } from './types';
import DraftContext from './draftContext';
import draftReducer from './draftReducer';
import useContextType from '@/hooks/shared/useContextType';
import { useMinister } from '@/context/minister/useMinister';
import { useCreator } from '@/context/creator/useCreator';
import { resolveStudioSermonOwnerId } from '@/utils/studio-sermon-owner.util';
import { parseMinisterSermonsResponse } from '@/utils/sermon-list-map.util';
import {
    draftFromSermonIdAndPartial,
    ministerSermonDocToDraft,
    partialDraftToUpdateSermonDto,
} from '@/utils/sermon-draft-map.util';

const initialDraftState: IDraftContextValue['state'] = {
    drafts: [],
    isLoading: false,
    error: null,
    selectedDraft: null,
};

export const useDraft = () => {
    const context = useContext(DraftContext);
    if (!context) {
        throw new Error('useDraft must be used within a DraftProvider');
    }
    return context;
};

export const draftActions = {
    setDrafts: (payload: IDraft[]): DraftAction => ({
        type: SET_DRAFTS,
        payload,
    }),
    setLoading: (payload: boolean): DraftAction => ({
        type: SET_LOADING,
        payload,
    }),
    setError: (payload: string | null): DraftAction => ({
        type: SET_ERROR,
        payload,
    }),
    mergeDraft: (payload: IDraft): DraftAction => ({
        type: UPDATE_DRAFT,
        payload,
    }),
    removeDraft: (payload: string): DraftAction => ({
        type: DELETE_DRAFT,
        payload,
    }),
    setSelectedDraft: (payload: IDraft | null): DraftAction => ({
        type: SET_SELECTED_DRAFT,
        payload,
    }),
    clearError: (): DraftAction => ({ type: CLEAR_ERROR }),
};

export const DraftProvider: React.FC<{
    children: ReactNode;
    sermonApiOverride?: unknown;
}> = ({ children, sermonApiOverride }) => {
    const [state, dispatch] = useReducer(draftReducer, initialDraftState);
    const { userContext } = useContextType();
    const { ministerId: contextMinisterId } = useMinister();
    const { creatorId } = useCreator();
    const user = userContext.user as Record<string, unknown> | null;
    const ministerId = useMemo(
        () =>
            resolveStudioSermonOwnerId(user, contextMinisterId, creatorId),
        [user, contextMinisterId, creatorId],
    );

    const getSermonClient = useCallback(
        () => (sermonApiOverride ?? api.sermon) as typeof api.sermon,
        [sermonApiOverride],
    );

    const fetchDrafts = useCallback(async () => {
        dispatch(draftActions.setLoading(true));
        try {
            if (!ministerId) {
                dispatch(draftActions.setDrafts([]));
                dispatch(draftActions.clearError());
                return;
            }

            const client = getSermonClient();
            const res = await client.getSermonsByMinister(ministerId, {
                page: 1,
                limit: 100,
                sort: '-updatedAt',
                status: 'draft',
            });
            const { list } = parseMinisterSermonsResponse(res);
            const drafts = list.map(ministerSermonDocToDraft);
            dispatch(draftActions.setDrafts(drafts));
            dispatch(draftActions.clearError());
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMessage =
                err?.response?.data?.message ||
                (error instanceof Error
                    ? error.message
                    : 'Failed to fetch drafts');
            dispatch(draftActions.setError(errorMessage));
            dispatch(draftActions.setDrafts([]));
            console.error('Error fetching drafts:', error);
        }
    }, [getSermonClient, ministerId]);

    const saveDraft = useCallback(
        async (draft: Partial<IDraft>): Promise<IDraft> => {
            dispatch(draftActions.setLoading(true));
            try {
                const sermonId = draft.sermonId ?? draft.id;
                if (!sermonId) {
                    throw new Error(
                        'Cannot save draft without a sermon id. Finish the audio upload step first.',
                    );
                }
                const client = getSermonClient();
                const dto = partialDraftToUpdateSermonDto(draft);
                const res = await client.updateSermon(sermonId, dto);
                if (res.error) {
                    throw new Error(res.message || 'Failed to save draft');
                }
                const saved = draftFromSermonIdAndPartial(sermonId, draft);
                dispatch(draftActions.mergeDraft(saved));
                dispatch(draftActions.clearError());
                return saved;
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } } };
                const errorMessage =
                    err?.response?.data?.message ||
                    (error instanceof Error
                        ? error.message
                        : 'Failed to save draft');
                dispatch(draftActions.setError(errorMessage));
                throw error;
            } finally {
                dispatch(draftActions.setLoading(false));
            }
        },
        [getSermonClient],
    );

    const updateDraft = useCallback(
        async (draftId: string, draft: Partial<IDraft>): Promise<IDraft> => {
            dispatch(draftActions.setLoading(true));
            try {
                const client = getSermonClient();
                const dto = partialDraftToUpdateSermonDto(draft);
                const res = await client.updateSermon(draftId, dto);
                if (res.error) {
                    throw new Error(res.message || 'Failed to update draft');
                }
                const updated = draftFromSermonIdAndPartial(draftId, {
                    ...draft,
                    id: draftId,
                    sermonId: draftId,
                    draftId,
                });
                dispatch(draftActions.mergeDraft(updated));
                dispatch(draftActions.clearError());
                return updated;
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } } };
                const errorMessage =
                    err?.response?.data?.message ||
                    (error instanceof Error
                        ? error.message
                        : 'Failed to update draft');
                dispatch(draftActions.setError(errorMessage));
                throw error;
            } finally {
                dispatch(draftActions.setLoading(false));
            }
        },
        [getSermonClient],
    );

    const deleteDraft = useCallback(
        async (draftId: string) => {
            dispatch(draftActions.setLoading(true));
            try {
                const client = getSermonClient();
                const res = await client.moveSermonToBin(draftId, {});
                if (res.error) {
                    throw new Error(res.message || 'Failed to remove draft');
                }
                dispatch(draftActions.removeDraft(draftId));
                dispatch(draftActions.clearError());
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } } };
                const errorMessage =
                    err?.response?.data?.message ||
                    (error instanceof Error
                        ? error.message
                        : 'Failed to delete draft');
                dispatch(draftActions.setError(errorMessage));
                throw error;
            } finally {
                dispatch(draftActions.setLoading(false));
            }
        },
        [getSermonClient],
    );

    const loadDraftForUpload = useCallback((draft: IDraft) => {
        dispatch(draftActions.setSelectedDraft(draft));
    }, []);

    const value: IDraftContextValue = {
        state,
        dispatch,
        fetchDrafts,
        saveDraft,
        updateDraft,
        deleteDraft,
        loadDraftForUpload,
    };

    return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
};

export default DraftProvider;
