import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import { getDiscoveryHome } from '@/controllers/discovery.controller';

const discoveryRouter = Router({ mergeParams: true });

discoveryRouter.get('/home', Protect, getDiscoveryHome);

export default discoveryRouter;
