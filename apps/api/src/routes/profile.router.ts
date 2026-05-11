import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import { getMyProfile, updateMyProfile } from '@/controllers/profile.controller';

const profileRoutes: Router = Router({ mergeParams: true });

// Single endpoint family for both listener and minister profiles.
profileRoutes.get('/me', Protect, getMyProfile);
profileRoutes.put('/me', Protect, updateMyProfile);

export default profileRoutes;
