import { Router } from 'express';
import Protect from '../middlewares/checkAuth.mdw';
import {
    getMinister,
    getMinisters,
    updateMinister,
    inviteMinister,
    bulkInviteMinisters,
    resendMinisterInvite,
    acceptMinisterInvitation,
    setMinisterPassword,
    revokeMinisterInvitation,
    submitMinisterVerification,
    updateMinisterVerificationStatus,
    onboardMinisterPersonalComplete,
    onboardMinisterDocumentComplete,
    onboardMinisterAddressComplete,
    onboardMinisterMinistryComplete,
    onboardMinisterTourComplete,
    onboardMinisterFirstSermonComplete,
    skipMinisterOnboarding,
} from '../controllers/core/minister.controller';

const ministerRoutes: Router = Router({ mergeParams: true });

ministerRoutes.get('/', Protect, getMinister);
ministerRoutes.get('/list', Protect, getMinisters);
ministerRoutes.put('/', Protect, updateMinister);

ministerRoutes.post('/verification', Protect, submitMinisterVerification);
ministerRoutes.put(
    '/verification/status',
    Protect,
    updateMinisterVerificationStatus,
);

ministerRoutes.post(
    '/onboarding/personal-complete',
    Protect,
    onboardMinisterPersonalComplete,
);
ministerRoutes.post(
    '/onboarding/document-complete',
    Protect,
    onboardMinisterDocumentComplete,
);
ministerRoutes.post(
    '/onboarding/address-complete',
    Protect,
    onboardMinisterAddressComplete,
);
ministerRoutes.post(
    '/onboarding/ministry-complete',
    Protect,
    onboardMinisterMinistryComplete,
);
ministerRoutes.post(
    '/onboarding/tour-complete',
    Protect,
    onboardMinisterTourComplete,
);
ministerRoutes.post(
    '/onboarding/first-sermon-complete',
    Protect,
    onboardMinisterFirstSermonComplete,
);
ministerRoutes.post('/onboarding/skip', Protect, skipMinisterOnboarding);

ministerRoutes.post('/invite', Protect, inviteMinister);
ministerRoutes.post('/invite/bulk', Protect, bulkInviteMinisters);
ministerRoutes.post('/invite/resend', Protect, resendMinisterInvite);
ministerRoutes.post('/invite/accept', acceptMinisterInvitation);
ministerRoutes.post('/invite/revoke', Protect, revokeMinisterInvitation);

ministerRoutes.post('/set-password', Protect, setMinisterPassword);

export default ministerRoutes;
