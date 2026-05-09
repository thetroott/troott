import type { UploadInFlight, UploadsAction, UploadsState } from './uploads.types';

export function uploadsReducer(
    state: UploadsState,
    action: UploadsAction,
): UploadsState {
    switch (action.type) {
        case 'REGISTER_UPLOAD':
            return {
                ...state,
                inFlight: {
                    ...state.inFlight,
                    [action.payload.id]: action.payload.record,
                },
            };
        case 'PATCH_UPLOAD': {
            const cur = state.inFlight[action.payload.id] as UploadInFlight | undefined;
            if (!cur) return state;
            return {
                ...state,
                inFlight: {
                    ...state.inFlight,
                    [action.payload.id]: {
                        ...cur,
                        ...action.payload.patch,
                    },
                },
            };
        }
        case 'COMPLETE_UPLOAD': {
            const id = action.payload.id;
            const { [id]: _removed, ...rest } = state.inFlight;
            return {
                ...state,
                inFlight: rest,
                completedIds: [...state.completedIds, id],
            };
        }
        case 'FAIL_UPLOAD': {
            const id = action.payload.id;
            const { [id]: _removed, ...rest } = state.inFlight;
            return {
                ...state,
                inFlight: rest,
                failedIds: [...state.failedIds, id],
            };
        }
        default:
            return state;
    }
}
