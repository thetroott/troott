import { Document, Types } from 'mongoose';
import IUserDoc from '../user.interface';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a sermon topic / category.
 *
 * Topics form a flat (or single-level parent-child) taxonomy used to
 * classify sermons, series, and playlists. They drive discovery feeds,
 * listener preference onboarding, and trending content algorithms.
 */
interface ITopicDoc extends Document {
    /** Short unique code. */
    code: string;
    /** Display name (e.g. `Faith`, `Prayer`, `Leadership`). */
    name: string;
    /** URL-safe slug. */
    slug: string;
    /** Human-readable description of the topic. */
    description: string;
    /** Icon identifier or CDN URL used in the UI. */
    icon: string;
    /** Hex colour code for UI theming. */
    color: string;

    /** Slug of the parent topic (empty string if top-level). */
    parentTopic: string;

    /** Number of sermons tagged with this topic. */
    usageCount: number;
    /** Computed trending score for discovery ranking. */
    trendingScore: number;
    /** Whether the topic is visible to users. */
    isActive: boolean;

    /** Admin who created the topic. */
    createdBy: IUserDoc | any;

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

export type { ITopicDoc };
export default ITopicDoc;
