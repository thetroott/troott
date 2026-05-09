import type { NotificationsState } from './notifications.types';

export const notificationsInitial: NotificationsState = {
    items: [],
    unreadCount: 0,
    preferences: {
        push: {},
        email: {},
        sms: {},
    },
    isLoading: false,
};
