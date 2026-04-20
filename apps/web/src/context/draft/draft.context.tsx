import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ISermonUpload } from '@/utils/interfaces.util';
import Sermon from '@/api/sermon';
import api from '@/api/config';
import {
  readDevUploadDrafts,
  removeDevUploadDraft,
  isDevLocalUploadDraftId,
} from '@/utils/dev-upload-drafts.util';

// Draft interface extending ISermonUpload
export interface IDraft extends ISermonUpload {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Action types
type DraftAction =
  | { type: 'SET_DRAFTS'; payload: IDraft[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_DRAFT'; payload: IDraft }
  | { type: 'UPDATE_DRAFT'; payload: IDraft }
  | { type: 'DELETE_DRAFT'; payload: string }
  | { type: 'SET_SELECTED_DRAFT'; payload: IDraft | null }
  | { type: 'CLEAR_ERROR' };

// Initial state
export interface IDraftContext {
  drafts: IDraft[];
  isLoading: boolean;
  error: string | null;
  selectedDraft: IDraft | null;
}

const initialState: IDraftContext = {
  drafts: [],
  isLoading: false,
  error: null,
  selectedDraft: null,
};

// Reducer
const draftReducer = (state: IDraftContext, action: DraftAction): IDraftContext => {
  switch (action.type) {
    case 'SET_DRAFTS':
      return { ...state, drafts: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'ADD_DRAFT':
      return { ...state, drafts: [action.payload, ...state.drafts] };
    case 'UPDATE_DRAFT':
      return {
        ...state,
        drafts: state.drafts.map((d) => (d.id === action.payload.id ? action.payload : d)),
        selectedDraft:
          state.selectedDraft?.id === action.payload.id ? action.payload : state.selectedDraft,
      };
    case 'DELETE_DRAFT':
      return {
        ...state,
        drafts: state.drafts.filter((d) => d.id !== action.payload),
        selectedDraft: state.selectedDraft?.id === action.payload ? null : state.selectedDraft,
      };
    case 'SET_SELECTED_DRAFT':
      return { ...state, selectedDraft: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Context
const DraftContext = createContext<{
  state: IDraftContext;
  dispatch: React.Dispatch<DraftAction>;
  fetchDrafts: () => Promise<void>;
  saveDraft: (draft: Partial<IDraft>) => Promise<IDraft>;
  updateDraft: (draftId: string, draft: Partial<IDraft>) => Promise<IDraft>;
  deleteDraft: (draftId: string) => Promise<void>;
  loadDraftForUpload: (draft: IDraft) => void;
} | null>(null);

export const useDraft = () => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error('useDraft must be used within a DraftProvider');
  }
  return context;
};

// Provider
export const DraftProvider: React.FC<{ children: React.ReactNode; sermonApi?: Sermon }> = ({
  children,
  sermonApi,
}) => {
  const [state, dispatch] = useReducer(draftReducer, initialState);

  // Get sermon API instance
  const getSermonsApi = useCallback(() => {
    return api.sermon;
  }, []);

  // Fetch all drafts from API (Vite dev: merge local “upload complete” rows)
  const fetchDrafts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const devDrafts = import.meta.env.DEV
      ? (readDevUploadDrafts() as unknown as IDraft[])
      : [];

    try {
      const sermonApi = getSermonsApi() as unknown as {
        getDrafts?: () => Promise<{ data?: { data?: IDraft[] } }>;
      };

      if (typeof sermonApi.getDrafts !== 'function') {
        dispatch({ type: 'SET_DRAFTS', payload: devDrafts });
        dispatch({ type: 'CLEAR_ERROR' });
        return;
      }

      const response = await sermonApi.getDrafts();
      const apiDrafts = response?.data?.data || [];
      const merged =
        import.meta.env.DEV && devDrafts.length
          ? [...devDrafts, ...apiDrafts]
          : apiDrafts;
      dispatch({ type: 'SET_DRAFTS', payload: merged });
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        dispatch({ type: 'SET_DRAFTS', payload: devDrafts });
        dispatch({ type: 'CLEAR_ERROR' });
        if (devDrafts.length) {
          console.warn('Drafts API unavailable; showing dev upload drafts only.', error);
        }
        return;
      }
      const errorMessage = error?.response?.data?.message || 'Failed to fetch drafts';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error fetching drafts:', error);
    }
  }, [getSermonsApi]);

  // Save a new draft
  const saveDraft = useCallback(
    async (draft: Partial<IDraft>): Promise<IDraft> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const sermonApi = getSermonsApi() as unknown as {
          saveDraft?: (body: Record<string, unknown>) => Promise<{
            data?: { data?: IDraft; id?: string };
          }>;
        };
        if (typeof sermonApi.saveDraft !== 'function') {
          throw new Error('saveDraft is not implemented on sermon API');
        }
        const payload = {
          title: draft.title,
          description: draft.description,
          tags: draft.tags || [],
          category: draft.category,
          isPublic: draft.isPublic ?? false,
          scheduledDate: draft.scheduledDate,
          seriesId: draft.seriesId,
        };
        const response = await sermonApi.saveDraft(payload);
        const savedDraft = (response?.data?.data ||
          ({ ...draft, id: response?.data?.id } as IDraft)) as IDraft;
        dispatch({ type: 'ADD_DRAFT', payload: savedDraft });
        dispatch({ type: 'CLEAR_ERROR' });
        return savedDraft;
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to save draft';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },
    [getSermonsApi]
  );

  // Update an existing draft
  const updateDraft = useCallback(
    async (draftId: string, draft: Partial<IDraft>): Promise<IDraft> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const sermonApi = getSermonsApi() as unknown as {
          updateDraft?: (
            id: string,
            body: Record<string, unknown>,
          ) => Promise<{ data?: { data?: IDraft } }>;
        };
        if (typeof sermonApi.updateDraft !== 'function') {
          throw new Error('updateDraft is not implemented on sermon API');
        }
        const payload = {
          title: draft.title,
          description: draft.description,
          tags: draft.tags || [],
          category: draft.category,
          isPublic: draft.isPublic ?? false,
          scheduledDate: draft.scheduledDate,
          seriesId: draft.seriesId,
        };
        const response = await sermonApi.updateDraft(draftId, payload);
        const updatedDraft = (response?.data?.data ||
          ({ ...draft, id: draftId } as IDraft)) as IDraft;
        dispatch({ type: 'UPDATE_DRAFT', payload: updatedDraft });
        dispatch({ type: 'CLEAR_ERROR' });
        return updatedDraft;
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to update draft';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },
    [getSermonsApi]
  );

  // Delete a draft
  const deleteDraft = useCallback(
    async (draftId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        if (import.meta.env.DEV && isDevLocalUploadDraftId(draftId)) {
          removeDevUploadDraft(draftId);
          dispatch({ type: 'DELETE_DRAFT', payload: draftId });
          dispatch({ type: 'CLEAR_ERROR' });
          return;
        }
        const sermonApi = getSermonsApi() as unknown as {
          deleteDraft?: (id: string) => Promise<unknown>;
        };
        if (typeof sermonApi.deleteDraft !== 'function') {
          throw new Error('deleteDraft is not implemented on sermon API');
        }
        await sermonApi.deleteDraft(draftId);
        dispatch({ type: 'DELETE_DRAFT', payload: draftId });
        dispatch({ type: 'CLEAR_ERROR' });
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to delete draft';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },
    [getSermonsApi]
  );

  // Load draft for upload
  const loadDraftForUpload = useCallback((draft: IDraft) => {
    dispatch({ type: 'SET_SELECTED_DRAFT', payload: draft });
  }, []);

  return (
    <DraftContext.Provider
      value={{
        state,
        dispatch,
        fetchDrafts,
        saveDraft,
        updateDraft,
        deleteDraft,
        loadDraftForUpload,
      }}
    >
      {children}
    </DraftContext.Provider>
  );
};

// Export action creators for convenience
export const draftActions = {
  setDrafts: (payload: IDraft[]) => ({ type: 'SET_DRAFTS' as const, payload }),
  setLoading: (payload: boolean) => ({ type: 'SET_LOADING' as const, payload }),
  setError: (payload: string | null) => ({ type: 'SET_ERROR' as const, payload }),
  addDraft: (payload: IDraft) => ({ type: 'ADD_DRAFT' as const, payload }),
  updateDraft: (payload: IDraft) => ({ type: 'UPDATE_DRAFT' as const, payload }),
  deleteDraft: (payload: string) => ({ type: 'DELETE_DRAFT' as const, payload }),
  setSelectedDraft: (payload: IDraft | null) => ({
    type: 'SET_SELECTED_DRAFT' as const,
    payload,
  }),
  clearError: () => ({ type: 'CLEAR_ERROR' as const }),
};
