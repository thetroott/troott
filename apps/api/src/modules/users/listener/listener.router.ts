import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    getListener,
    getListeners,
    updateListener,
    updateInterests,
    inviteListener,
    bulkInviteListeners,
    resendListenerInvite,
    acceptListenerInvitation,
    setListenerPassword,
    revokeListenerInvitation,
} from './listener.controller';

const listenerRoutes: Router = Router({ mergeParams: true });

listenerRoutes.get('/', Protect, getListener);
listenerRoutes.get('/list', Protect, getListeners);
listenerRoutes.put('/', Protect, updateListener);

listenerRoutes.put('/interests', Protect, updateInterests);

listenerRoutes.post('/invite', Protect, inviteListener);
listenerRoutes.post('/invite/bulk', Protect, bulkInviteListeners);
listenerRoutes.post('/invite/resend', Protect, resendListenerInvite);
listenerRoutes.post('/invite/accept', acceptListenerInvitation);
listenerRoutes.post('/invite/revoke', Protect, revokeListenerInvitation);

listenerRoutes.post('/set-password', Protect, setListenerPassword);

export default listenerRoutes;
