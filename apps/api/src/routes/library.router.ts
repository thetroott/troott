import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import {
    createLibrary,
    deleteLibrary,
    getAllLibraries,
    getLibraryById,
    getLibraryByUser,
    updateLibrary,
} from '@/controllers/core/library.controller';
import uploadHandler from '../middlewares/upload.mdw';

const libraryRouter = Router({ mergeParams: true });

// List all libraries — restrict with staff middleware at the router if needed
libraryRouter.get('/', Protect, getAllLibraries);
libraryRouter.post('/', Protect, uploadHandler, createLibrary);

// Listener-scoped library (JWT user must own the listener profile)
libraryRouter.get('/user/:userId', Protect, getLibraryByUser);
libraryRouter.get('/user/:userId/:libraryId', Protect, getLibraryById);
libraryRouter.put('/user/:userId', Protect, uploadHandler, updateLibrary);
libraryRouter.delete('/user/:userId', Protect, deleteLibrary);

export default libraryRouter;
