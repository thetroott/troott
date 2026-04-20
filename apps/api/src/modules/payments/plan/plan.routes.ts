import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import { addNewPlan, getPlans, updatePlan } from './plan.controller';

const planRoutes: Router = Router({
    mergeParams: true,
});

planRoutes.get('/', Protect, getPlans);
planRoutes.post('/', Protect, addNewPlan);

// a patch route to update a plan, including enabling/disabling it
planRoutes.patch('/:planId', Protect, updatePlan);

export default planRoutes;
