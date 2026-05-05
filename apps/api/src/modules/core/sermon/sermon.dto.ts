import { ContentState, ContentStatus } from '../../../utils/enums.util';
import { SeriesPreviewDTO } from '../series/series.dto';
import type { ImageSource, SermonSource } from './sermon.interface';
import { IMinisterDoc, ISeriesDoc } from '@/utils/interfaces.util';

/**
 * @name SermonUploadDTO
 * @description A DTO for uploading a sermon.
 * This DTO is used to upload a sermon.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {SermonUploadDTO}
 */
export interface SermonUploadDTO {
    id: string;
    title: string;
    description: string;

    size: number;
    duration: number;
    releaseDate: Date;
    releaseYear: number;
    topic: string;
    tags: Array<string>;
    isPublic: boolean;
    isSeries?: boolean;
    series?: Array<string>;
    minister: string | string;
    playlist?: string | string;
    publishedBy: string | string;
}

/**
 * @name SermonDTO
 * @description A DTO for a sermon.
 * This DTO is used to return a sermon to the client.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {SermonDTO}
 */
export interface SermonDTO {
    id: string;
    title: string;
    description: string;
    duration: number;
    image: Partial<ImageSource>;
    minister: Partial<IMinisterDoc>;

    topic: string; // sermon topic or category
    tags: Array<string>;
    isPublic: boolean;
    shareableUrl: string;

    releaseDate: string;
    releaseYear: number;

    seriesId?: string;
    series?: SeriesPreviewDTO;
}

/**
 * @name SermonPlaybackDTO
 * @description A DTO for playing a sermon.
 * This DTO is used to play a sermon.
 * It contains the playback information about the sermon.
 * @access Public
 * @returns {SermonPlaybackDTO}
 */
export interface SermonPlaybackDTO {
    id: string;
    sermon: Partial<SermonSource>;
}

/**
 * @name UpdateSermonDTO
 * @description A DTO for updating a sermon.
 * This DTO is used to update a sermon.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {UpdateSermonDTO}
 */
export interface UpdateSermonDTO {
    id?: string;

    title?: string;
    description?: string;
    duration?: number;
    shareableUrl?: string;
    sermonUrl?: string;
    imageUrl?: string;
    size?: number;
    releaseDate?: string | Date;
    releaseYear?: string | number;

    topic?: string;
    tags?: Array<string>;
    isPublic?: boolean;
    allowDownload?: boolean;
    allowComment?: boolean;

    isSeries?: boolean;
    seriesId?: Partial<ISeriesDoc>;
    series?: Partial<ISeriesDoc> | unknown;

    sermon?: Partial<SermonSource>;
    image?: Partial<ImageSource>;
    minister?: Partial<IMinisterDoc>;
    playlist?: unknown;

    status?: ContentStatus;
    state?: ContentState;
    isPublished?: boolean;
    publishedBy?: string;
    publishedAt?: Date;
    versionId?: unknown;
    changesSummary?: string;
    uploadRef?: string;
    uploadSummary?: unknown;
}

/**
 * @name PublishSermonDTO
 * @description A DTO for publishing a sermon.
 * This DTO is used to publish a sermon.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {PublishSermonDTO}
 */
/**
 * Payload for {@link SermonService.handlePublishSermon} / {@link SermonService.validateSermonPublish}.
 * `sermon` is the audio **upload id** used to resolve the draft sermon document.
 */
export interface PublishSermonDTO {
    title: string;
    description: string;
    duration: number;
    /** Audio upload id (matches `uploadSummary.uploadId`) */
    sermon: string;
    image: Partial<ImageSource> | string | unknown;
    size: number;
    releaseDate: Date | string;
    releaseYear: number;
    topic: string;
    tags: Array<string> | string;
    isPublic: boolean;
    isSeries: boolean;
    publishedBy: string | string;

    id?: string;
    status?: ContentStatus;
    state?: ContentState;
    isPublished?: boolean;
    publishedAt?: Date;
}

/**
 * @name DeleteSermonDTO
 * @description A DTO for deleting a sermon.
 * This DTO is used to delete a sermon.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {DeleteSermonDTO}
 */
export interface DeleteSermonDTO {
    id: string;
    state?: ContentState;
    status?: ContentStatus;
    publishedBy?: string;
}

/**
 * @name moveSermonToBinDTO
 * @description A DTO for moving a sermon to the bin.
 * This DTO is used to move a sermon to the bin.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {moveSermonToBinDTO}
 */
export interface MoveSermonToBinDTO {
    id: string;
    state?: ContentState;
    status?: ContentStatus;
    publishedBy?: string;
}

/**
 * @name UploadDTO
 * @description A DTO for uploading a sermon.
 * This DTO is used to upload a sermon.
 * It contains the basic information about the sermon.
 * @access Public
 * @returns {UploadDTO}
 */
export interface UploadDTO {
    id: string;
    file: string;
    uploadedBy: string;
    uploadRef: string;
}
