import { Document, Types } from 'mongoose';
import ISermonDoc from './core/sermon.interface';
import IUserDoc from './user.interface';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a user comment on a sermon.
 *
 * Supports threaded replies (via {@link parent} / {@link replies})
 * and emoji reactions. Comments can be disabled per-sermon via
 * {@link ISermonDoc.allowComment}.
 */
interface ICommentDoc extends Document {
    /** Short unique code. */
    code: string;
    /** Polymorphic resource type this comment is attached to. */
    resource: string;
    /** Comment body text. */
    message: string;
    /** URL-safe slug. */
    slug: string;
    /** Whether the comment is visible (can be disabled by moderation). */
    isEnabled: boolean;

    /** Emoji / text reactions from other users. */
    reactions: Array<{
        /** User who reacted. */
        user: IUserDoc | any;
        /** Reaction content (emoji or short text). */
        message: string;
    }>;
    /** Parent comment (null for top-level comments). */
    parent: ICommentDoc | any;
    /** User who wrote the comment. */
    author: IUserDoc | any;
    /** Direct replies to this comment. */
    replies: Array<ICommentDoc | any>;
    /** The sermon this comment is attached to. */
    mediaItem: ISermonDoc | any;

    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-update timestamp. */
    updatedAt: string;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

export type { ICommentDoc };
export default ICommentDoc;
