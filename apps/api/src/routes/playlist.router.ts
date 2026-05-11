import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import {
    addItemToPlaylist,
    createPlaylist,
    deletePlaylist,
    getAllPlaylists,
    getPlaylistById,
    getPlaylistsByUser,
    removeItemFromPlaylist,
    updatePlaylist,
} from '@/controllers/playlist.controller';
import uploadHandler from '../middlewares/upload.mdw';

const playlistRouter = Router({ mergeParams: true });

playlistRouter.post('/', Protect, uploadHandler, createPlaylist);
// List and user-scoped routes before `/:id`
playlistRouter.get('/', Protect, getAllPlaylists);
playlistRouter.get('/user/:userId', Protect, getPlaylistsByUser);
playlistRouter.get('/:id', Protect, getPlaylistById);
playlistRouter.put('/:id', Protect, uploadHandler, updatePlaylist);
playlistRouter.delete('/:id', Protect, deletePlaylist);
playlistRouter.patch('/:playlistId/add', Protect, addItemToPlaylist);
playlistRouter.patch('/:playlistId/remove', Protect, removeItemFromPlaylist);

export default playlistRouter;
