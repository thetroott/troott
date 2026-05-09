import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    getMinister,
    getMinisters,
    updateMinister,
    inviteMinister,
    bulkInviteMinisters,
    resendMinisterInvite,
    acceptMinisterInvitation,
    setMinisterPassword,
    revokeMinisterInvitation,
    submitMinisterVerification,
    updateMinisterVerificationStatus,
} from './minister.controller';

const ministerRoutes: Router = Router({ mergeParams: true });

ministerRoutes.get('/', Protect, getMinister);
ministerRoutes.get('/list', Protect, getMinisters);
ministerRoutes.put('/', Protect, updateMinister);

ministerRoutes.post('/verification', Protect, submitMinisterVerification);
ministerRoutes.put(
    '/verification/status',
    Protect,
    updateMinisterVerificationStatus,
);

ministerRoutes.post('/invite', Protect, inviteMinister);
ministerRoutes.post('/invite/bulk', Protect, bulkInviteMinisters);
ministerRoutes.post('/invite/resend', Protect, resendMinisterInvite);
ministerRoutes.post('/invite/accept', acceptMinisterInvitation);
ministerRoutes.post('/invite/revoke', Protect, revokeMinisterInvitation);

ministerRoutes.post('/set-password', Protect, setMinisterPassword);

export default ministerRoutes;
