import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import {
    getCreator,
    getCreators,
    getCreatorProfile,
    createCreator,
    updateCreator,
    inviteCreator,
    acceptCreatorInvitation,
    setCreatorPassword,
    revokeCreatorInvitation,
    submitCreatorVerification,
    updateCreatorVerificationStatus,
    onboardCreatorPersonalComplete,
    onboardCreatorDocumentComplete,
    onboardCreatorAddressComplete,
    onboardCreatorMinistryComplete,
    onboardCreatorTourComplete,
    onboardCreatorFirstSermonComplete,
    skipCreatorOnboarding,
} from '@/controllers/core/creator.controller';

const creatorRoutes: Router = Router({ mergeParams: true });

creatorRoutes.post('/invite', Protect, inviteCreator);
creatorRoutes.post('/invite/accept', acceptCreatorInvitation);
creatorRoutes.post('/invite/revoke', Protect, revokeCreatorInvitation);

creatorRoutes.post('/set-password', Protect, setCreatorPassword);

creatorRoutes.post('/', Protect, createCreator);
creatorRoutes.get('/', Protect, getCreatorProfile);
creatorRoutes.get('/list', Protect, getCreators);
creatorRoutes.put('/', Protect, updateCreator);

creatorRoutes.post('/verification', Protect, submitCreatorVerification);
creatorRoutes.put(
    '/verification/status',
    Protect,
    updateCreatorVerificationStatus,
);

creatorRoutes.post(
    '/onboarding/personal-complete',
    Protect,
    onboardCreatorPersonalComplete,
);
creatorRoutes.post(
    '/onboarding/document-complete',
    Protect,
    onboardCreatorDocumentComplete,
);
creatorRoutes.post(
    '/onboarding/address-complete',
    Protect,
    onboardCreatorAddressComplete,
);
creatorRoutes.post(
    '/onboarding/ministry-complete',
    Protect,
    onboardCreatorMinistryComplete,
);
creatorRoutes.post(
    '/onboarding/tour-complete',
    Protect,
    onboardCreatorTourComplete,
);
creatorRoutes.post(
    '/onboarding/first-sermon-complete',
    Protect,
    onboardCreatorFirstSermonComplete,
);
creatorRoutes.post('/onboarding/skip', Protect, skipCreatorOnboarding);

creatorRoutes.get('/:id', Protect, getCreator);

export default creatorRoutes;
