import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    inviteAdmin,
    acceptAdminInvitation,
    setAdminPassword,
    revokeAdminInvitation,
    createAdmin,
    getAdmin,
    getAdmins,
    getAdminProfile,
    updateAdmin,
    deleteAdmin,
} from './admin.controller';

const adminRoutes: Router = Router({ mergeParams: true });

// Admin invitation routes (must be called before profile routes)
adminRoutes.post('/invite', Protect, inviteAdmin);
adminRoutes.post('/invite/accept', acceptAdminInvitation);
adminRoutes.post('/invite/revoke', Protect, revokeAdminInvitation);

// Admin password routes
adminRoutes.post('/set-password', Protect, setAdminPassword);

// Admin profile routes
adminRoutes.post('/', Protect, createAdmin);
adminRoutes.get('/', Protect, getAdminProfile);
adminRoutes.get('/list', Protect, getAdmins);
adminRoutes.get('/:id', Protect, getAdmin);
adminRoutes.put('/:id', Protect, updateAdmin);
adminRoutes.delete('/:id', Protect, deleteAdmin);

export default adminRoutes;
