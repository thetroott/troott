import type { ApiUpload, ICountry, IDebitCard } from './_api-types';
import Library from './Library.model';
import Minister from './Minister.model';
import Playback from './Playback.model';
import Playlist from './Playlist.model';
import Series from './Series.model';
import Sermon from './Sermon.model';
import type Subscription from './Subscription.model';
import Topic from './Topic.model';
import Transaction from './Transaction.model';
import User from './User.model';

interface Listener {
    code: string;

    firstName: string;
    lastName: string;
    middleName: string;
    gender: string;
    dateOfBirth: Date;
    phoneNumber: string;
    phoneCode: string;
    countryPhone: string;
    country: ICountry;
    homeCountry: ICountry;

    email: string;
    slug: string;
    avatar: ApiUpload | string;
    banner: ApiUpload | string;

    onboarding: {
        step: number;
        status: string;
    };

    topics: Array<Topic | any>;
    ministers: Array<Minister | any>;
    ministry: string;
    card: IDebitCard;

    likedSermons: Array<Sermon | any>;
    LikedSeries: Array<Series | any>;
    sharedSermons: Array<Sermon | any>;
    recentlyPlayed: Array<Playback | any>;

    listeningHistory: Array<Sermon | any>;
    following: Array<Minister | any>;
    followers: Array<User | any>;
    interests: Array<Topic | any>;
    viewedSermonBites: Array<any>;
    sharedSermonBites: Array<any>;
    savedSermonBites: Array<any>;
    badges: Array<any>;
    subscriptions: Array<Subscription | any>;

    user: User | any;
    settings: string | any;
    Library: Library | any;
    playlists: Array<Playlist | any>;
    subscription: Subscription | any;
    transactions: Array<Transaction | any>;

    createdBy: User | any;

    recentSearches: Array<{
        _id?: string;
        query: string;
        searchedAt: string;
    }>;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export default Listener;
