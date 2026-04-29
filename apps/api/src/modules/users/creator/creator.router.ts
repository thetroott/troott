import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    getCreator,
    getCreators,
    getCreatorProfile,
    createCreator,
    updateCreator,
    inviteCreator,
    acceptCreatorInvitation,
    setCreatorPassword,
    revokeCreatorInvitation,
    submitCreatorVerification,
    updateCreatorVerificationStatus,
} from './creator.controller';

const creatorRoutes: Router = Router({ mergeParams: true });

creatorRoutes.post('/invite', Protect, inviteCreator);
creatorRoutes.post('/invite/accept', acceptCreatorInvitation);
creatorRoutes.post('/invite/revoke', Protect, revokeCreatorInvitation);

creatorRoutes.post('/set-password', Protect, setCreatorPassword);

creatorRoutes.post('/', Protect, createCreator);
creatorRoutes.get('/', Protect, getCreatorProfile);
creatorRoutes.get('/list', Protect, getCreators);
creatorRoutes.put('/', Protect, updateCreator);

creatorRoutes.post('/verification', Protect, submitCreatorVerification);
creatorRoutes.put(
    '/verification/status',
    Protect,
    updateCreatorVerificationStatus,
);

creatorRoutes.get('/:id', Protect, getCreator);

export default creatorRoutes;
