import { DbModels } from './enums.util';
import {
    IAudioMetadata,
    IDocumentMetadata,
    IImageMetadata,
    IVideoMetadata,
} from '@/dtos/core/sermon.dto';

export type IUploadMetadata =
    | IAudioMetadata
    | IImageMetadata
    | IVideoMetadata
    | IDocumentMetadata;

export type LinkedModel = DbModels.SERMON | DbModels.USER | DbModels.PLAYLIST;

// types/passport-apple.d.ts
declare module 'passport-apple';

export type SocialIdKey = 'googleId' | 'githubId' | 'appleId';
