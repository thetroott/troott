export interface NotificationsState {
    items: unknown[];
    unreadCount: number;
    preferences: {
        push: Record<string, boolean>;
        email: Record<string, boolean>;
        sms: Record<string, boolean>;
    };
    isLoading: boolean;
}

export type NotificationsAction = { type: string; payload?: unknown };
