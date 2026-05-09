export interface InvitationsState {
    inbox: Record<
        string,
        {
            token: string;
            status: string;
            invitedBy: string;
            role: string;
            expiresAt: string;
            metadata: unknown;
        }
    >;
    outbox: Record<
        string,
        {
            token: string;
            status: string;
            invitee: string;
            role: string;
            expiresAt: string;
            accessCount: number;
        }
    >;
    isLoading: boolean;
    error: string | null;
}

export type InvitationsAction = { type: string; payload?: unknown };
