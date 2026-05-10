import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

export interface ILibraryDoc extends Document {
    user: ObjectId | any;
    likedSermons: Array<ObjectId | any>;
    savedBtes: Array<ObjectId | any>;
    playlists: Array<ObjectId | any>;
    favouriteMinisters: Array<ObjectId | any>;
    mostPlayed: Array<ObjectId | any>;
    recentlyPlayed: Array<string>;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
