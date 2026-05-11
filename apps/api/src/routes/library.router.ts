import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import {
    createLibrary,
    deleteLibrary,
    getAllLibraries,
    getLibraryById,
    getLibraryByUser,
    updateLibrary,
} from '@/controllers/library.controller';
import uploadHandler from '../middlewares/upload.mdw';

const libraryRouter = Router({ mergeParams: true });

// List all (staff) — register before any `/:param` routes
libraryRouter.get('/', Protect, getAllLibraries);
libraryRouter.post('/', Protect, uploadHandler, createLibrary);

// User-scoped library (signed-in; controller enforces self or staff)
libraryRouter.get('/user/:userId', Protect, getLibraryByUser);
libraryRouter.get('/user/:userId/:libraryId', Protect, getLibraryById);
libraryRouter.put('/user/:userId', Protect, uploadHandler, updateLibrary);
libraryRouter.delete('/user/:userId', Protect, deleteLibrary);

export default libraryRouter;
