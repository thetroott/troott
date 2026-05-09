import type { QueueAction, QueueState } from './queue.types';

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
    switch (action.type) {
        case 'SYNC_QUEUE_BRIDGE': {
            const p = action.payload as Partial<QueueState>;
            return { ...state, ...p };
        }
        default:
            return state;
    }
}
