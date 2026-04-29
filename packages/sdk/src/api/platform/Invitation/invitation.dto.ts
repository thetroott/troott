
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



export enum InvitationType {
    TEAM = 'teamInvite',
    GUEST = 'guestInvite',
    ADMIN = 'adminInvite',
    TALENT = 'talentInvite',
    PROJECT = 'projectInvite',
    WORKSPACE = 'workspaceInvite',
    SQUAD = 'squadInvite',
    HACKATHON = 'hackathonInvite',
    ENTRY = 'entryInvite',
}

export enum InvitationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    VALIDATED = 'validated',
    DECLINED = 'declined',
    EXPIRED = 'expired',
    REVOKED = 'revoked',
}

export enum InviteSendType {
    BULK = 'bulk',
    SINGLE = 'single',
}
