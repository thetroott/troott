import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    getUser,
    getUsers,
    deactivateAccount,
    getOnboardingStatus,
    setUserType,
    setBasicInfo,
    setTalentInfo,
    setBusinessInfo,
    setUserInfo,
    completeOnboarding,
} from './user.controller';

const userRoutes: Router = Router({ mergeParams: true });

// User profile routes
userRoutes.get('/', Protect, getUser);
userRoutes.get('/list', Protect, getUsers);
userRoutes.delete('/deactivate', Protect, deactivateAccount);

// Onboarding routes - all require authentication
userRoutes.post('/onboard/user-type', Protect, setUserType);
userRoutes.post('/onboard/basic-info', Protect, setBasicInfo);
userRoutes.post('/onboard/talent-info', Protect, setTalentInfo);
userRoutes.post('/onboard/business-info', Protect, setBusinessInfo);
userRoutes.post('/onboard/user-info', Protect, setUserInfo);
userRoutes.post('/onboard/complete', Protect, completeOnboarding);
userRoutes.get('/onboard/status', Protect, getOnboardingStatus);

export default userRoutes;
