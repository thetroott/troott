import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import {
    deleteSermon,
    moveSermonToBin,
    restoreSermonFromBin,
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
    uploadSermonImage,
    getSermonsByMinisterMostPlayed,
    getFavoriteMinisterSermons,
    cancelSermonProcessing,
} from '@/controllers/core/sermon.controller';
import uploadHandler from '../middlewares/upload.mdw';
import {
    sermonAudioUploadSizeLimit,
    sermonUploadRateLimiter,
} from '../middlewares/sermon-upload.security.mdw';
import { requireMinisterProfile } from '../middlewares/require-minister.mdw';
import {
    abortSermonAudioMultipart,
    completeSermonAudioMultipart,
    completeSermonCoverMultipart,
    createSermonAudioMultipart,
    listSermonAudioParts,
    signSermonAudioPart,
} from '@/controllers/s3-multipart.sermon.controller';

const sermonRouter = Router({ mergeParams: true });

// Creator / editor mutations (authenticated)
sermonRouter.post(
    '/s3/multipart/create',
    Protect,
    sermonUploadRateLimiter,
    requireMinisterProfile,
    createSermonAudioMultipart,
);
sermonRouter.post(
    '/s3/multipart/sign-part',
    Protect,
    signSermonAudioPart,
);
sermonRouter.get(
    '/s3/multipart/list-parts',
    Protect,
    listSermonAudioParts,
);
sermonRouter.post(
    '/s3/multipart/abort',
    Protect,
    abortSermonAudioMultipart,
);
sermonRouter.post(
    '/s3/multipart/complete-audio',
    Protect,
    requireMinisterProfile,
    completeSermonAudioMultipart,
);
sermonRouter.post(
    '/s3/multipart/complete-cover',
    Protect,
    completeSermonCoverMultipart,
);

sermonRouter.post(
    '/start-upload',
    Protect,
    sermonUploadRateLimiter,
    requireMinisterProfile,
    sermonAudioUploadSizeLimit,
    uploadHandler,
    uploadSermon,
);
sermonRouter.post('/image-upload', Protect, uploadHandler, uploadSermonImage);
sermonRouter.post('/publish/:id', Protect, publishSermon);
sermonRouter.post('/cancel-processing/:id', Protect, cancelSermonProcessing);

sermonRouter.put('/update/:id', Protect, updateSermon);
sermonRouter.put('/move-to-bin/:id', Protect, moveSermonToBin);
sermonRouter.put('/restore/:id', Protect, restoreSermonFromBin);
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
sermonRouter.get(
    '/user/recently-played',
    Protect,
    getUserRecentlyPlayedSermons,
);
sermonRouter.get('/user/popular', Protect, getPopularSermonsRecentlyPlayed);
sermonRouter.get(
    '/user/favorite-ministers',
    Protect,
    getFavoriteMinisterSermons,
);
sermonRouter.get('/user/interests', Protect, getSermonsByUserInterests);

sermonRouter.get('/', getAllSermons);
sermonRouter.get('/:id', Protect, getSermonById);

export default sermonRouter;
