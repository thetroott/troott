import { Router } from 'express';
import Protect from '@/middlewares/checkAuth.mdw';
import {
    acceptStudioInvite,
    createStudio,
    deleteStudioInvite,
    getMyStudio,
    getStudio,
    listMyStudios,
    patchStudio,
    postStudioInvite,
    rejectStudioInvite,
} from '@/controllers/core/studio.controller';

const studioRoutes = Router({ mergeParams: true });

studioRoutes.post('/', Protect, createStudio);
studioRoutes.get('/me', Protect, getMyStudio);
studioRoutes.get('/mine/list', Protect, listMyStudios);
studioRoutes.get('/:id', Protect, getStudio);
studioRoutes.patch('/:id', Protect, patchStudio);

studioRoutes.post('/:id/invites', Protect, postStudioInvite);
studioRoutes.delete('/:id/invites/:inviteId', Protect, deleteStudioInvite);
studioRoutes.post(
    '/:id/invites/:inviteId/accept',
    Protect,
    acceptStudioInvite,
);
studioRoutes.post(
    '/:id/invites/:inviteId/reject',
    Protect,
    rejectStudioInvite,
);

export default studioRoutes;
