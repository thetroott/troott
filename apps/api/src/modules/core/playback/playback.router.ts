import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    getPlaybackForSermon,
    listPlaybackProgress,
    savePlaybackProgress,
} from './playback.controller';

const playbackRouter = Router({ mergeParams: true });

playbackRouter.post('/', Protect, savePlaybackProgress);
playbackRouter.get('/', Protect, listPlaybackProgress);
playbackRouter.get('/sermon/:sermonId', Protect, getPlaybackForSermon);

export default playbackRouter;
