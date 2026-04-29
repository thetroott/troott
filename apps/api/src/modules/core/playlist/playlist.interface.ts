import { Document, Types } from 'mongoose';
import { PlaylistType } from './playlist.enums';

type ObjectId = Types.ObjectId;

export interface IPlaylistDoc extends Document {
    title: string;
    description: string;
    playlistCover: string;
    totalDuration: string;
    isCollaborative: boolean;
    isPublic: boolean;
    likes: number;
    playlistType: PlaylistType;
    items: Array<{ itemId: ObjectId | any; type: PlaylistType }>;

    user: ObjectId | any;
    createdBy: ObjectId | any;

    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
