import express, { Request, Response, NextFunction } from 'express';
import authRoutes from '@/routes/auth.router';
import sermonRoutes from '@/routes/sermon.router';
import libraryRoutes from '@/routes/library.router';
import playlistRoutes from '@/routes/playlist.router';
import userRoutes from '@/routes/user.router';
import listenerRoutes from '@/routes/listener.router';
import ministerRoutes from '@/routes/minister.router';
import creatorRoutes from '@/routes/creator.router';
import adminRoutes from '@/routes/admin.router';
import webhookRoutes from '@/routes/webhook.router';
import searchRoutes from '@/routes/search.router';
import discoveryRoutes from '@/routes/discovery.router';
import shareableLinkRoutes from '@/routes/shareable-link.router';
import playbackRoutes from '@/routes/playback.router';
import openRoutes from '@/routes/open.router';
import roleRoutes from '@/routes/role.router';
import storageRoutes from '@/routes/storage.router';
import invitationRoutes from '@/routes/invitation.router';
import planRoutes from '@/routes/plan.router';
import subscriptionRoutes from '@/routes/subscription.router';
import { openSermonTeaserLimiter } from '@/middlewares/open-teaser.ratelimit.mdw';
import { ENVType } from '@/utils/enums.util';
import { ENV } from '@/utils/env.util';

const router = express.Router();

router.use('/webhook', webhookRoutes);
router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/storage', storageRoutes);
router.use('/invitation', invitationRoutes);
router.use('/plans', planRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/library', libraryRoutes);
router.use('/playlist', playlistRoutes);
router.use('/sermon', sermonRoutes);
router.use('/search', searchRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/share', shareableLinkRoutes);
router.use('/open', openSermonTeaserLimiter, openRoutes);
router.use('/playback', playbackRoutes);
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
