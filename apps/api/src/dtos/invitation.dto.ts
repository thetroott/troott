import { InvitationStatus, InvitationType } from '../interfaces/invitation.interface';

export interface CreateInvitationDTO {
    invitedBy: string;
    inviteeEmail: string;
    inviteeUserId?: string;
    inviteType: InvitationType;
    resourceId: string;
    expiresAt?: Date;
    inviteStatus?: InvitationStatus;
    inviteToken?: string;
    metadata?: Record<string, unknown>;
}

export interface InviteTokenDTO {
    token: string;
    email: string;
}

export interface CreateBulkInvitationDTO {
    invitedBy: string;
    inviteeEmails: string[];
    inviteeUserIds?: string[];
    inviteType: InvitationType;
    resourceId: string;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
}
