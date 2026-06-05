import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import uploadHandler from '../middlewares/upload.mdw';
import { uploadDocument, uploadImage } from '@/controllers/storage.controller';

const storageRoutes: Router = Router({ mergeParams: true });

// Storage routes
storageRoutes.post('/upload', Protect, uploadHandler, uploadImage);
storageRoutes.post('/upload-document', Protect, uploadHandler, uploadDocument);

export default storageRoutes;
