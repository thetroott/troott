import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    createPreferences,
    deletePreferences,
    getAllPreferences,
    getMyPreferences,
    getUserPreferences,
    patchMyPreferences,
    updatePreferences,
} from './preference.controller';

const preferenceRouter = Router({ mergeParams: true });

/** Static paths before `/:userId` so `me` is not captured as an id. */
preferenceRouter.get('/', Protect, getAllPreferences);
preferenceRouter.get('/me', Protect, getMyPreferences);
preferenceRouter.patch('/me', Protect, patchMyPreferences);

preferenceRouter.post('/', Protect, createPreferences);
preferenceRouter.get('/:userId', Protect, getUserPreferences);
preferenceRouter.patch('/:userId', Protect, updatePreferences);
preferenceRouter.delete('/:userId', Protect, deletePreferences);

export default preferenceRouter;
