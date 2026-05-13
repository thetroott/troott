import { Document, Types } from 'mongoose';
import { ImageSource } from './sermon.interface';
import IMinisterDoc from './minister.interface';
import ITopicDoc from './topic.interface';
import IUserDoc from '../user.interface';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a sermon series (album).
 *
 * A series groups related {@link ISermonDoc sermons} under a shared
 * title, banner, and topic -- analogous to an album in music streaming.
 * It can be attributed to multiple ministers and carries its own
 * engagement counters.
 */
interface ISeriesDoc extends Document {
    /** Short unique code. */
    code: string;
    /** URL-safe slug. */
    slug: string;

    /** Series title. */
    title: string;
    /** Description or synopsis. */
    description: string;
    /** Cover / banner image source. */
    banner: ImageSource | any;
    /** Sum of all sermon durations in the series (seconds). */
    totalDuration: number;
    /** Number of sermons in the series. */
    numberOfSermons: number;
    /** Free-form tags for search and discovery. */
    tags: Array<string>;
    /** ISO-639 language code. */
    language: string;

    /** Minister(s) who contributed to the series. */
    ministers: Array<IMinisterDoc | any>;
    /** Topic or category. */
    topic: ITopicDoc | any;

    /** Publishing status (`draft` or `published`). */
    status: string;
    /** Whether the series is publicly accessible. */
    isPublic: boolean;
    /** Public shareable URL. */
    shareableUrl: string;

    /** Total play count across all sermons. */
    playCount: number;
    /** Total download count. */
    downloadCount: number;
    /** Total comment count. */
    commentCount: number;
    /** Total share count. */
    shareCount: number;
    /** Total like count. */
    likeCount: number;
    /** Whether the series is featured by the platform. */
    featured: boolean;

    /** The user who created the series. */
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

export type { ISeriesDoc };
export default ISeriesDoc;
