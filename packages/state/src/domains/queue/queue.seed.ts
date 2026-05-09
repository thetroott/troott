import type { QueueState } from './queue.types';

export const queueInitial: QueueState = {
    queueIds: [],
    upNextIds: [],
    recentlyPlayedIds: [],
    historyIds: [],
    contextUri: null,
};
