import { createDomainContext } from '../_shared/createDomain';
import { notificationsReducer } from './notifications.reducer';
import { notificationsInitial } from './notifications.seed';
import type { NotificationsAction, NotificationsState } from './notifications.types';

const d = createDomainContext<NotificationsState, NotificationsAction>(
    'notifications',
    notificationsReducer,
    notificationsInitial,
);

export const NotificationsProvider = d.Provider;
export const useNotificationsState = d.useState;
export const useNotificationsDispatch = d.useDispatch;
