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
import type { DraftAction, DraftReducerState } from './types';

const draftReducer = (
    state: DraftReducerState,
    action: DraftAction,
): DraftReducerState => {
    switch (action.type) {
        case SET_DRAFTS:
            return { ...state, drafts: action.payload, isLoading: false };
        case SET_LOADING:
            return { ...state, isLoading: action.payload };
        case SET_ERROR:
            return { ...state, error: action.payload, isLoading: false };
        case ADD_DRAFT:
            return { ...state, drafts: [action.payload, ...state.drafts] };
        case UPDATE_DRAFT: {
            const idx = state.drafts.findIndex(
                (d) => d.id === action.payload.id,
            );
            if (idx === -1) {
                return {
                    ...state,
                    drafts: [action.payload, ...state.drafts],
                    selectedDraft:
                        state.selectedDraft?.id === action.payload.id
                            ? action.payload
                            : state.selectedDraft,
                };
            }
            return {
                ...state,
                drafts: state.drafts.map((d) =>
                    d.id === action.payload.id ? action.payload : d,
                ),
                selectedDraft:
                    state.selectedDraft?.id === action.payload.id
                        ? action.payload
                        : state.selectedDraft,
            };
        }
        case DELETE_DRAFT:
            return {
                ...state,
                drafts: state.drafts.filter((d) => d.id !== action.payload),
                selectedDraft:
                    state.selectedDraft?.id === action.payload
                        ? null
                        : state.selectedDraft,
            };
        case SET_SELECTED_DRAFT:
            return { ...state, selectedDraft: action.payload };
        case CLEAR_ERROR:
            return { ...state, error: null };
        default:
            return state;
    }
};

export default draftReducer;
