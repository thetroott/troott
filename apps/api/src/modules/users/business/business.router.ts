import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    getBusiness,
    getBusinesses,
    updateBusiness,
    updateTags,
    addTag,
    removeTag,
    inviteBusiness,
    acceptBusinessInvitation,
    setBusinessPassword,
    revokeBusinessInvitation,
} from './business.controller';

const businessRoutes: Router = Router({ mergeParams: true });

// Business profile routes
businessRoutes.get('/', Protect, getBusiness);
businessRoutes.get('/list', Protect, getBusinesses);
businessRoutes.put('/', Protect, updateBusiness);

// Business tags routes
businessRoutes.put('/tags', Protect, updateTags);
businessRoutes.post('/tags', Protect, addTag);
businessRoutes.delete('/tags/:tag', Protect, removeTag);

// Business invitation routes
businessRoutes.post('/invite', Protect, inviteBusiness);
businessRoutes.post('/invite/accept', acceptBusinessInvitation);
businessRoutes.post('/invite/revoke', Protect, revokeBusinessInvitation);

// Business password routes
businessRoutes.post('/set-password', Protect, setBusinessPassword);

export default businessRoutes;
