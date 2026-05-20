import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import {
    getUser,
    getUsers,
    deactivateAccount,
    editUser,
} from '@/controllers/user.controller';

const userRoutes: Router = Router({ mergeParams: true });

// User profile routes
userRoutes.get('/', Protect, getUser);
userRoutes.put('/', Protect, editUser);
userRoutes.get('/list', Protect, getUsers);
userRoutes.delete('/deactivate', Protect, deactivateAccount);

export default userRoutes;
