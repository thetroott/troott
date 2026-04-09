import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    getTalent,
    getTalents,
    updateTalent,
    updateInterests,
    addSkill,
    removeSkill,
    inviteTalent,
    acceptTalentInvitation,
    setTalentPassword,
    revokeTalentInvitation,
} from './talent.controller';

const talentRoutes: Router = Router({ mergeParams: true });

// Talent profile routes
talentRoutes.get('/', Protect, getTalent);
talentRoutes.get('/list', Protect, getTalents);
talentRoutes.put('/', Protect, updateTalent);

// Talent interests routes
talentRoutes.put('/interests', Protect, updateInterests);

// Talent skills routes
talentRoutes.post('/skills', Protect, addSkill);
talentRoutes.delete('/skills/:skill', Protect, removeSkill);

// Talent invitation routes
talentRoutes.post('/invite', Protect, inviteTalent);
talentRoutes.post('/invite/accept', acceptTalentInvitation);
talentRoutes.post('/invite/revoke', Protect, revokeTalentInvitation);

// Talent password routes
talentRoutes.post('/set-password', Protect, setTalentPassword);

export default talentRoutes;
