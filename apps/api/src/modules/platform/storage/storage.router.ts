import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import uploadHandler from '../../../middlewares/upload.mdw';
import { uploadImage } from './storage.controller';

const storageRoutes: Router = Router({ mergeParams: true });

// Storage routes
storageRoutes.post('/upload', Protect, uploadHandler, uploadImage);

export default storageRoutes;
