import express, { Request, Response, NextFunction } from 'express';
import authRoutes from '../../modules/authentication/auth/auth.router';
import sermonRoutes from '../../modules/core/sermon/sermon.router';
import libraryRoutes from '../../modules/core/library/library.router';
import playlistRoutes from '../../modules/core/playlist/playlist.router';
import preferenceRoutes from '../../modules/core/preference/preference.router';
import userRoutes from '../../modules/users/user/user.router';
import listenerRoutes from '../../modules/users/listener/listener.router';
import ministerRoutes from '../../modules/users/minister/minister.router';
import creatorRoutes from '../../modules/users/creator/creator.router';
import adminRoutes from '../../modules/users/admin/admin.route';
import webhookRoutes from '../../modules/platform/webhook/webhook.router';
import searchRoutes from '../../modules/core/search/search.router';
import discoveryRoutes from '../../modules/core/discovery/discovery.router';
import shareableLinkRoutes from '../../modules/platform/shareable-link/shareable-link.router';
import playbackRoutes from '../../modules/core/playback/playback.router';
import pushDeviceRoutes from '../../modules/notifications/push/push-device.router';
import openRoutes from '../../modules/core/open/open.router';
import { openSermonTeaserLimiter } from '../../middlewares/open-teaser.ratelimit.mdw';
import { ENVType } from '@/utils/enums.util';
import { ENV } from '@/utils/env.util';

const router = express.Router();

router.use('/webhook', webhookRoutes);
router.use('/auth', authRoutes);
router.use('/library', libraryRoutes);
router.use('/playlist', playlistRoutes);
router.use('/sermon', sermonRoutes);
router.use('/search', searchRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/share', shareableLinkRoutes);
router.use('/open', openSermonTeaserLimiter, openRoutes);
router.use('/playback', playbackRoutes);
router.use('/notifications', pushDeviceRoutes);
router.use('/preference', preferenceRoutes);
router.use('/user', userRoutes);
router.use('/listener', listenerRoutes);
router.use('/minister', ministerRoutes);
router.use('/creator', creatorRoutes);
router.use('/admin', adminRoutes);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
    let enviornemnt = ENVType.DEVELOPMENT;

    if (ENV.isProduction()) {
        enviornemnt = ENVType.PRODUCTION;
    } else if (ENV.isStaging()) {
        enviornemnt = ENVType.STAGING;
    } else if (ENV.isDevelopment()) {
        enviornemnt = ENVType.DEVELOPMENT;
    }

    res.status(200).render('health-check', {
        error: false,
        errors: [],
        data: {
            name: 'Troott API',
            version: '01.00.00',
        },
        message: `troott-api is running in ${enviornemnt} mode`,
        status: 200,
    });
});

export default router;
