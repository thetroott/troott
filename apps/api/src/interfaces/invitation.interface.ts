import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a platform invitation.
 *
 * Invitations are sent by existing users (typically admins) to onboard
 * new admins, ministers, creators, or listeners. Each invitation carries
 * a time-limited token that the invitee redeems to create their account.
 */
interface IInvitationDoc extends Document {
    /** What type of account the invitee will receive. */
    inviteType: InvitationType;
    /** User ID of the person who sent the invitation. */
    invitedBy: ObjectId;
    /** ID of the resource the invitation relates to (e.g. organisation, team). */
    resourceId: ObjectId;

    /** Email address the invitation was sent to. */
    inviteeEmail: string;
    /** User ID of the invitee (populated after account creation). */
    inviteeUserId: ObjectId;
    /** When the invitation was sent. */
    invitedAt: Date;
    /** Signed token the invitee uses to accept (null once consumed). */
    inviteToken: string | null;
    /** Current lifecycle status. */
    inviteStatus: InvitationStatus;

    /** When the invitation expires. */
    expiresAt: Date;
    /** When the invitation was accepted. */
    acceptedAt: Date;
    /** When the invitation was revoked by the sender. */
    revokedAt: Date;
    /** When the invitation was declined by the invitee. */
    declinedAt?: Date;

    /** Arbitrary metadata attached to the invitation. */
    metadata: Record<string, unknown>;

    /** When the invitation was created. */
    createdAt: Date;
    /** When the invitation was last updated. */
    updatedAt: Date;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    Id: ObjectId;
}

/** Account type granted by an invitation. */
export enum InvitationType {
    ADMIN = 'adminInvite',
    LISTENER = 'listenerInvite',
    MINISTER = 'ministerInvite',
    CREATOR = 'creatorInvite',
}

/** Lifecycle status of an invitation. */
export enum InvitationStatus {
    /** Invitation sent, awaiting response. */
    PENDING = 'pending',
    /** Invitee accepted and created their account. */
    ACCEPTED = 'accepted',
    /** Invitation token validated but account not yet created. */
    VALIDATED = 'validated',
    /** Invitee declined the invitation. */
    DECLINED = 'declined',
    /** Invitation expired before being acted on. */
    EXPIRED = 'expired',
    /** Sender revoked the invitation. */
    REVOKED = 'revoked',
}

/** Whether the invitation targets a single user or a batch. */
export enum InviteSendType {
    BULK = 'bulk',
    SINGLE = 'single',
}

export default IInvitationDoc;
