import {
    SermonDTO,
    SermonPlaybackDTO,
    UpdateSermonDTO,
    UploadDTO,
} from './sermon.dto';
import type { ISermonDoc } from './sermon.interface';

class SermonMapper {
    constructor() {}

    /**
     * @name mapSermonPlayback
     * @param sermon
     * @returns SermonPlaybackDTO
     * @description Converts a sermon document into a DTO for API responses.
     */
    public async mapSermonPlayback(
        sermon: ISermonDoc,
    ): Promise<SermonPlaybackDTO> {
        const result: SermonPlaybackDTO = {
            id: sermon.id.toString(),
            sermon: {
                cdnUrl: sermon.sermon.cdnUrl,
                originalUrl: sermon.sermon.originalUrl,
            },
        };

        return result;
    }

    /**
     * @name mapUploadSermonImage
     * @param sermon
     * @returns UploadDTO
     * @description Converts a sermon document into a DTO for API responses.
     */
    public async mapUploadSermonImage(sermon: ISermonDoc): Promise<UploadDTO> {
        const result: UploadDTO = {
            id: sermon.image.uploadId,
            uploadRef: sermon.image.uploadId,
            uploadedBy: sermon.image.uploadedBy.toString(),
            file: sermon.image.thumbnailUrl,
        };

        return result;
    }

    /**
     * @name mapUploadSermonFile
     * @param sermon
     * @returns UploadDTO
     * @description Converts a sermon document into a DTO for API responses.
     */
    public async mapUploadSermonFile(sermon: ISermonDoc): Promise<UploadDTO> {
        const result: UploadDTO = {
            id: sermon.image.uploadId,
            uploadRef: sermon.image.uploadId,
            uploadedBy: sermon.image.uploadedBy.toString(),
            file: sermon.image.thumbnailUrl,
        };

        return result;
    }

    //mapSermonUpload
    public async mapSermonUpdate(sermon: ISermonDoc): Promise<UpdateSermonDTO> {
        const result: UpdateSermonDTO = {
            id: sermon.id.toString(),
            title: sermon.title,
            description: sermon.description,
            shareableUrl: sermon.sermon.shareableUrl,
            releaseDate: sermon.releaseDate.toISOString(),
            releaseYear: sermon.releaseYear.toString(),

            topic: sermon.topic,
            tags: sermon.tags,
            isPublic: sermon.isPublic,
            allowDownload: sermon.allowDownload,
            allowComment: sermon.allowComment,

            isSeries: sermon.isSeries,
            seriesId: {
                id: sermon.series.id,
                title: sermon.series.title,
            },

            sermon: {
                cdnUrl: sermon.sermon.cdnUrl,
                originalUrl: sermon.sermon.originalUrl,
            },
            image: {
                thumbnailUrl: sermon.image.thumbnailUrl,
                originalUrl: sermon.image.originalUrl,
            },
            minister: {
                id: sermon.minister.id,
                ministerialName: sermon.minister.ministerialName,
            },

            status: sermon.status,
            state: sermon.state,
            isPublished: sermon.isPublished,
            publishedBy: sermon.publishedBy,
            publishedAt: sermon.publishedAt,
        };

        return result;
    }

    /**
     * @name mapSermon
     * @param sermon
     * @returns SermonDTO
     * @description Converts a sermon document into a DTO for API responses.
     */
    public async mapSermon(sermon: ISermonDoc): Promise<SermonDTO> {
        const result: SermonDTO = {
            id: sermon._id.toString(),

            title: sermon.title,
            description: sermon.description,
            duration: sermon.sermon.duration,

            image: {
                thumbnailUrl: sermon.image.thumbnailUrl,
                originalUrl: sermon.image.originalUrl,
            },
            minister: {
                id: sermon.minister.id,
                ministerialName: sermon.minister.ministerialName,
            },

            topic: sermon.topic,
            tags: sermon.tags,
            isPublic: sermon.isPublic,
            releaseDate: sermon.releaseDate.toISOString(),
            releaseYear: sermon.releaseYear,
            shareableUrl: sermon.sermon.shareableUrl,

            // series: {
            //     id: sermon.series._id.toString(),
            //     title: sermon.series.title,
            //     image: {
            //         thumbnailUrl: sermon.series.imageUrl,
            //     },
            //     position: sermon.series.position,
            // },
            // seriesId: sermon.series._id.toString(),
        };

        return result;
    }
}

export default new SermonMapper();
