export interface QueueState {
    queueIds: string[];
    upNextIds: string[];
    recentlyPlayedIds: string[];
    historyIds: string[];
    contextUri: string | null;
}

export type QueueAction =
    | {
          type: 'SYNC_QUEUE_BRIDGE';
          payload: Partial<QueueState>;
      }
    | { type: string; payload?: unknown };
