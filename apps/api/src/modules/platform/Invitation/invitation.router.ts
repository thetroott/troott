import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    getInvitationById,
    getInvitationsByInviteeEmail,
    getInvitationsByInviter,
    getInvitationsByResource,
} from './invitation.controller';

const invitationRouter: Router = Router({ mergeParams: true });

invitationRouter.get('/id/:invitationId', Protect, getInvitationById);
invitationRouter.get('/inviter/:inviterId', Protect, getInvitationsByInviter);
invitationRouter.get('/invitee', Protect, getInvitationsByInviteeEmail);
invitationRouter.get('/resource/:resourceId', Protect, getInvitationsByResource);

export default invitationRouter;
