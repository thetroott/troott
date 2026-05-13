import { Document, Types } from 'mongoose';
import { ICountry, IDebitCard, Upload } from '../common.interface';
import ILibraryDoc from './library.interface';
import IMinisterDoc from './minister.interface';
import IPlaybackDoc from './playback.interface';
import IPlaylistDoc from './playlist.interface';
import ISermonDoc from './sermon.interface';
import ISeriesDoc from './series.interface';
import ISubscriptionDoc from '../subscription.interface';
import ITopicDoc from './topic.interface';
import ITransactionDoc from '../transaction.interface';
import IUserDoc from '../user.interface';



type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a listener profile.
 *
 * A listener is the consumer side of the platform -- someone who
 * browses, plays, downloads, and interacts with sermons. Every
 * listener is backed by an {@link IUserDoc} for authentication.
 *
 * Owns a {@link ILibraryDoc}, playlists, subscriptions, transactions,
 * and engagement data (likes, recently played, followed ministers).
 */
interface IListenerDoc extends Document {
    /** Public listener code. */
    code: string;

    /** First name. */
    firstName: string;
    /** Last name. */
    lastName: string;
    /** Middle name. */
    middleName: string;
    /** Gender identity. */
    gender: string;
    /** Date of birth. */
    dateOfBirth: Date;
    /** Primary phone number (digits only). */
    phoneNumber: string;
    /** International dialling code. */
    phoneCode: string;
    /** Country associated with the phone number. */
    countryPhone: string;
    /** Country of residence. */
    country: ICountry;
    /** Country of origin / nationality. */
    homeCountry: ICountry;

    /** Primary email address. */
    email: string;
    /** URL-safe slug. */
    slug: string;
    /** Profile picture upload reference. */
    avatar: Upload;
    /** Banner / cover image upload reference. */
    banner: Upload;

    /** Onboarding progress tracker. */
    onboarding: {
        /** Current step index. */
        step: number;
        /** Descriptive status (e.g. `completed`, `in-progress`). */
        status: string;
    };

    /** Topics the listener is interested in. */
    topics: Array<ITopicDoc | any>;
    /** Ministers the listener follows. */
    ministers: Array<IMinisterDoc | any>;
    /** Ministry affiliation or preference. */
    ministry: string;
    /** Saved payment card for subscriptions and purchases. */
    card: IDebitCard;

    /** Sermons the listener has liked. */
    likedSermons: Array<ISermonDoc | any>;
    /** Series the listener has liked. */
    LikedSeries: Array<ISeriesDoc | any>;
    /** Sermons the listener has shared. */
    sharedSermons: Array<ISermonDoc | any>;
    /** Most recent playback events (capped at ~20 items for the "Recently Played" rail). */
    recentlyPlayed: Array<IPlaybackDoc | any>;

    /** Full listening history. */
    listeningHistory: Array<ISermonDoc | any>;
    /** Ministers / users this listener follows. */
    following: Array<IMinisterDoc | any>;
    /** Users following this listener. */
    followers: Array<IUserDoc | any>;
    /** Topic-based interests. */
    interests: Array<ITopicDoc | any>;
    /** Viewed sermon bite clips. */
    viewedSermonBites: Array<any>;
    /** Shared sermon bite clips. */
    sharedSermonBites: Array<any>;
    /** Saved / bookmarked sermon bite clips. */
    savedSermonBites: Array<any>;
    /** Earned badges. */
    badges: Array<any>;
    /** All subscriptions (current and past). */
    subscriptions: Array<ISubscriptionDoc | any>;

    /** Underlying authentication user. */
    user: IUserDoc | any;
    /** Reference to the listener's settings document. */
    settings: string | any;
    /** The listener's personal library. */
    Library: ILibraryDoc | any;
    /** Playlists created or followed by the listener. */
    playlists: Array<IPlaylistDoc | any>;
    /** Active subscription. */
    subscription: ISubscriptionDoc | any;
    /** Payment transactions. */
    transactions: Array<ITransactionDoc | any>;

    /** The user who created this listener record. */
    createdBy: IUserDoc | any;

    /** Capped list of recent search queries. */
    recentSearches: Array<{
        _id?: any;
        query: string;
        searchedAt: string;
    }>;

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

export type { IListenerDoc };
export default IListenerDoc;
