import User from './User.model';
import Sermon from './Sermon.model';

interface Topic {
    code: string;
    name: string; // the name of the topic
    slug: string; // the slug of the topic
    description: string; // the description of the topic
    icon: string;
    color: string;

    parentTopic: string; // the parent topic of the topic

    // Ranking
    usageCount: number; // how often sermons use this topic
    trendingScore: number;
    isActive: boolean; // whether the topic is active

    // relationships
    createdBy: User | any;

    // time stamps
    createdAt: string;
    updatedAt: string;

    // unique ids
    _version: number;
    _id: string;
    id: string;
}

export default Topic;

// link to
// listeners
// ministers
// sermons
// playlists
// series
