export interface SharesState {
    links: Record<
        string,
        {
            resourceType: string;
            resourceId: string;
            token: string;
            expiresAt?: string | null;
            revokedAt?: string | null;
            accessCount: number;
        }
    >;
    sharedTrackIds: string[];
    sharedSeriesIds: string[];
}

export type SharesAction = { type: string; payload?: unknown };
