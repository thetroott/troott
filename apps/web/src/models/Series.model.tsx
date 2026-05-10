import { ImageSource } from './Sermon.model';
import Minister from './Minister.model';
import Topic from './Topic.model';
import User from './User.model';

interface Series {
    code: string;
    slug: string;

    // Basic Information
    title: string;
    description: string;
    banner: ImageSource | any;
    totalDuration: number; // total duration of all the sermons in the series
    numberOfSermons: number; // number of sermons in the series
    tags: Array<string>;
    language: string;

    // Relationships
    ministers: Array<Minister | any>; // list of minister(s)
    topic: Topic | any; // series topic or category

    // Status
    status: string; // draft or published
    isPublic: boolean;
    shareableUrl: string; // shareable URL for the series;

    // Engagement
    playCount: number;
    downloadCount: number;
    commentCount: number;
    shareCount: number;
    likeCount: number;
    featured: boolean;

    // Ownership
    createdBy: User | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}

export default Series;
