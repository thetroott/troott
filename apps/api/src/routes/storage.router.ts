import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import uploadHandler from '../middlewares/upload.mdw';
import { uploadDocument, uploadImage } from '@/controllers/storage.controller';
import {
    abortStorageMultipart,
    completeStorageMultipart,
    createStorageMultipart,
    listStorageParts,
    signStoragePart,
} from '@/controllers/s3-multipart.storage.controller';

const storageRoutes: Router = Router({ mergeParams: true });

storageRoutes.post('/s3/multipart/create', Protect, createStorageMultipart);
storageRoutes.post('/s3/multipart/sign-part', Protect, signStoragePart);
storageRoutes.get('/s3/multipart/list-parts', Protect, listStorageParts);
storageRoutes.post('/s3/multipart/abort', Protect, abortStorageMultipart);
storageRoutes.post('/s3/multipart/complete', Protect, completeStorageMultipart);

// Storage routes
storageRoutes.post('/upload', Protect, uploadHandler, uploadImage);
storageRoutes.post('/upload-document', Protect, uploadHandler, uploadDocument);

export default storageRoutes;
