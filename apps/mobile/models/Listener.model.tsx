import { ICountry } from '../utils/interfaces.util';
import Library from './Library.model';
import Minister from './Minister.model';
import Playback from './Playback.model';
import Playlist from './Playlist.model';
import Series from './Series.model';
import Sermon from './Sermon.model';
import Subscription from './Subscription.model';
import Topic from './Topic.model';
import Transaction from './Transaction.model';
import User from './User.model';

interface Listener {
    code: string; // user public ID
  
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
    avatar: string;
    banner: string;

    onboarding: {
        step: number;
        status: string;
    };

    // Relationships
    topics: Array<Topic | any>;
    ministers: Array<Minister | any>;
    ministry: string;

    likedSermons: Array<Sermon | any>;
    LikedSeries: Array<Series | any>;
    sharedSermons: Array<Sermon | any>;
    recentlyPlayed: Array<Playback | any>; // the recently played media items by the listener < 20 items / Playback IDs (or MediaItem IDs)

    user: User | any;
    settings: string | any;
    Library: Library | any;
    playlists: Array<Playlist | any>;
    subscription: Subscription | any;
    transactions: Array<Transaction | any>;

    createdBy: User | any;

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export default Listener;
