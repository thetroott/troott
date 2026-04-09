import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import uploadHandler from '../../../middlewares/upload.mdw';
import {
    createGuest,
    getGuest,
    getGuests,
    updateGuest,
    deleteGuest,
} from './guest.controller';

const guestRoutes: Router = Router({ mergeParams: true });

// Guest routes
guestRoutes.post('/', Protect, uploadHandler, createGuest);
guestRoutes.get('/list', Protect, getGuests);
guestRoutes.get('/:id', Protect, getGuest);
guestRoutes.put('/:id', Protect, uploadHandler, updateGuest);
guestRoutes.delete('/:id', Protect, deleteGuest);

export default guestRoutes;
