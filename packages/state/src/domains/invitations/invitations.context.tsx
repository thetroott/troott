import { createDomainContext } from '../_shared/createDomain';
import { invitationsReducer } from './invitations.reducer';
import { invitationsInitial } from './invitations.seed';
import type { InvitationsAction, InvitationsState } from './invitations.types';

const d = createDomainContext<InvitationsState, InvitationsAction>(
    'invitations',
    invitationsReducer,
    invitationsInitial,
);

export const InvitationsProvider = d.Provider;
export const useInvitationsState = d.useState;
export const useInvitationsDispatch = d.useDispatch;
