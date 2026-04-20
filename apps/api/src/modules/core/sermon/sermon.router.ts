import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import optionalAuth from '../../../middlewares/optionalAuth.mdw';
import {
    deleteSermon,
    moveSermonToBin,
    publishSermon,
    updateSermon,
    uploadSermon,
    getSermonById,
    getSermonsByTopic,
    getAllSermons,
    getSermonsByminister,
    getSermonsByministerMostLiked,
    getSermonsByministerMostShared,
    getSermonsByministerRecentlyPublished,
    getSermonsMostPlayed,
    getSermonsMostLiked,
    getSermonsMostShared,
    getSermonsRecentlyPublished,
    getRecentlyAddedSermons,
    getUserRecentlyPlayedSermons,
    getPopularSermonsRecentlyPlayed,
    getSermonsByUserInterests,
    uploadSermonCover,
    getSermonsByMinisterMostPlayed,
    getFavoriteMinisterSermons,
} from './sermon.controller';
import uploadHandler from '../../../middlewares/upload.mdw';

const sermonRouter = Router({ mergeParams: true });

// Creator / editor mutations (authenticated)
sermonRouter.post('/start-upload', Protect, uploadHandler, uploadSermon);
sermonRouter.post('/image-upload', Protect, uploadHandler, uploadSermonCover);
sermonRouter.post('/publish/:id', Protect, publishSermon);

sermonRouter.put('/update/:id', Protect, updateSermon);
sermonRouter.put('/move-to-bin/:id', Protect, moveSermonToBin);
sermonRouter.delete('/delete/:id', Protect, deleteSermon);

// Multi-segment GET routes before `/:id` and `/`
sermonRouter.get('/topic/:topic', getSermonsByTopic);

sermonRouter.get('/minister/:ministerId', getSermonsByminister);
sermonRouter.get(
    '/minister/:ministerId/most-played',
    getSermonsByMinisterMostPlayed,
);
sermonRouter.get(
    '/minister/:ministerId/most-liked',
    getSermonsByministerMostLiked,
);
sermonRouter.get(
    '/minister/:ministerId/most-shared',
    getSermonsByministerMostShared,
);
sermonRouter.get(
    '/minister/:ministerId/recently-published',
    getSermonsByministerRecentlyPublished,
);

sermonRouter.get('/stats/most-played', getSermonsMostPlayed);
sermonRouter.get('/stats/most-liked', getSermonsMostLiked);
sermonRouter.get('/stats/most-shared', getSermonsMostShared);
sermonRouter.get('/stats/recently-published', getSermonsRecentlyPublished);

// Personalized rails (signed-in)
sermonRouter.get('/user/recently-added', Protect, getRecentlyAddedSermons);
sermonRouter.get('/user/recently-played', Protect, getUserRecentlyPlayedSermons);
sermonRouter.get('/user/popular', Protect, getPopularSermonsRecentlyPlayed);
sermonRouter.get('/user/favorite-ministers', Protect, getFavoriteMinisterSermons);
sermonRouter.get('/user/interests', Protect, getSermonsByUserInterests);

sermonRouter.get('/', getAllSermons);
sermonRouter.get('/:id', optionalAuth, getSermonById);

export default sermonRouter;
