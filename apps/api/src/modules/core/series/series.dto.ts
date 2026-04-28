import { IMinisterDoc } from '@/utils/interfaces.util';
import { ImageSource, SermonSource } from '../sermon/sermon.interface';
import { SermonDTO } from '../sermon/sermon.dto';
import { ContentState, ContentStatus } from '@/utils/content.enums';

/**
 * @name CreateSeriesDTO
 * @description A DTO for creating a series.
 * This DTO is used to create a series.
 * It contains the basic information about the series.
 * @access Public
 * @returns {CreateSeriesDTO}
 */
export interface CreateSeriesDTO {
    id: string;
    title: string;
    description: string;
    image: Partial<ImageSource>;

    ministers: Array<Partial<IMinisterDoc>>; // list of minister(s)
    sermons: Array<Partial<SermonDTO>>;
    ownerId: Partial<IMinisterDoc>;

    totalDuration: number; // total duration of all the sermons in the series
    numberOfSermons: number; // number of sermons in the series

    topic: string; // sermon topic or category
    tags: Array<string>;
    isPublic: boolean;
}

/**
 * @name SeriesDTO
 * @description A DTO for a series.
 * This DTO is used to return a series to the client.
 * It contains the basic information about the series.
 * @access Public
 * @returns {SeriesDTO}
 */
export interface SeriesDTO {
    id: string;
    title: string;
    description: string;
    image: Partial<ImageSource>;

    ministers: Array<Partial<IMinisterDoc>>; // list of minister(s)
    sermons: Array<Partial<SermonDTO>>;
    ownerId: Partial<IMinisterDoc>;

    status: ContentStatus; // draft or published

    totalDuration: number; // total duration of all the sermons in the series
    numberOfSermons: number; // number of sermons in the series

    topic: string; // sermon topic or category
    tags: Array<string>;
    isPublic: boolean;
    shareableUrl: string; // shareable URL for the series; // list of minister(s)
}

/**
 * @name SeriesPreviewDTO
 * @description A DTO for a series preview.
 * This DTO is used to return a series preview to the client.
 * It contains the basic information about the series.
 * @access Public
 * @returns {SeriesPreviewDTO}
 */
export interface SeriesPreviewDTO {
    id: string;
    title: string;
    image: Partial<ImageSource>;
    position: number; // position of the sermon in the series list
}

/**
 * @name UpdateSeriesDTO
 * @description A DTO for updating a series.
 * This DTO is used to update a series.
 * It contains the basic information about the series.
 * @access Public
 * @returns {UpdateSeriesDTO}
 */
export interface UpdateSeriesDTO {
    id: string;
    title: string;
    description: string;
    image: Partial<ImageSource>;

    ministers: Array<Partial<IMinisterDoc>>; // list of minister(s)
    sermons: Array<Partial<SermonDTO>>;
    ownerId: Partial<IMinisterDoc>;

    status: ContentStatus; // draft or published

    totalDuration: number; // total duration of all the sermons in the series
    numberOfSermons: number; // number of sermons in the series

    topic: string; // sermon topic or category
    tags: Array<string>;
    isPublic: boolean;
}

/**
 * @name DeleteSeriesDTO
 * @description A DTO for deleting a series.
 * This DTO is used to delete a series.
 * It contains the basic information about the series.
 * @access Public
 * @returns {DeleteSeriesDTO}
 */
export interface DeleteSeriesDTO {
    id: string;
    state?: ContentState;
    status?: ContentStatus;
    publishedBy?: string;
}

/**
 * @name MoveSeriesToBinDTO
 * @description A DTO for moving a series to the bin.
 * This DTO is used to move a series to the bin.
 * It contains the basic information about the series.
 * @access Public
 * @returns {MoveSeriesToBinDTO}
 */
export interface MoveSeriesToBinDTO {
    id: string;
    state?: ContentState;
    status?: ContentStatus;
    publishedBy?: string;
}
