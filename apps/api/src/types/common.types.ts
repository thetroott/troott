import { IAudioMetadata } from '@/dtos/core/sermon.dto';
import { DbModels } from './common.enum';

export type Nullable<T> = T | null;
export type IUploadMetadata = IAudioMetadata;

export type LinkedModel = DbModels.SERMON | DbModels.USER | DbModels.PLAYLIST;

// types/passport-apple.d.ts
declare module 'passport-apple';

export type SocialIdKey = 'googleId' | 'githubId' | 'appleId';
