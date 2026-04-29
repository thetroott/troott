import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import { newSubscription } from './subscription.controller';

const subscriptionRoutes: Router = Router({
    mergeParams: true,
});

subscriptionRoutes.get('/', Protect);
subscriptionRoutes.post('/', Protect, newSubscription);

export default subscriptionRoutes;
