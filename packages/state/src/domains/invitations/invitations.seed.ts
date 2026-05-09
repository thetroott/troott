import type { InvitationsState } from './invitations.types';

export const invitationsInitial: InvitationsState = {
    inbox: {},
    outbox: {},
    isLoading: false,
    error: null,
};
