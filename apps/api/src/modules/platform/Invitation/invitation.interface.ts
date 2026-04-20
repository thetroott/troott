import { Document, Types } from 'mongoose';

// Use Mongoose's Types.ObjectId for interface compatibility
export type ObjectId = Types.ObjectId;

export interface IInvitationDoc extends Document {
    inviteType: InvitationType;
    invitedBy: ObjectId;
    resourceId: ObjectId;

    // invitee: { email: string; userId: ObjectId };
    inviteeEmail: string;
    inviteeUserId: ObjectId;
    invitedAt: Date;
    inviteToken: string | null;
    inviteStatus: InvitationStatus;

    expiresAt: Date;
    acceptedAt: Date;
    revokedAt: Date;
    declinedAt?: Date;

    metadata: Record<string, unknown>;

    // time stamps
    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    Id: ObjectId;
}

//ENUMS

export enum InvitationType {
    ADMIN = 'adminInvite',
    LISTENER = 'listenerInvite',
    MINISTER = 'ministerInvite',
    CREATOR = 'creatorInvite',
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
