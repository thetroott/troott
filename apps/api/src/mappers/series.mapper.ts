import { UploadDTO } from '@/dtos/sermon.dto';
import { SeriesDTO, UpdateSeriesDTO } from '@/dtos/series.dto';
import { ISeriesDoc } from '@/modules/core/series/series.interface';

class SeriesMapper {
    constructor() {}

    /**
     * @name mapSeriesDTO
     * @param series
     * @returns SeriesDTO
     * @description Converts a series document into a DTO for API responses.
     */
    public async mapSeriesDTO(series: ISeriesDoc): Promise<SeriesDTO> {
        const result: SeriesDTO = {
            id: series.id.toString(),
            title: series.title,
            description: series.description,
            image: {
                thumbnailUrl: series.image.thumbnailUrl,
                originalUrl: series.image.originalUrl,
            },

            ministers: series.ministers.map((minister) => ({
                id: minister.id,
                ministerialName: minister.ministerialName,
            })),
            sermons: series.sermons.map((sermon) => ({
                id: sermon.id,
                title: sermon.title,
                sermon: {
                    cdnUrl: sermon.sermon.cdnUrl,
                    originalUrl: sermon.sermon.originalUrl,
                },
                image: {
                    thumbnailUrl: sermon.image.thumbnailUrl,
                    originalUrl: sermon.image.originalUrl,
                },
            })),
            ownerId: {
                id: series.ownerId.id,
                ministerialName: series.ownerId.ministerialName,
            },

            status: series.status,
            totalDuration: series.totalDuration,
            numberOfSermons: series.numberOfSermons,

            topic: series.topic,
            tags: series.tags,
            isPublic: series.isPublic,
            shareableUrl: series.shareableUrl,
        };

        return result;
    }

    public async mapSeriesUpdate(series: ISeriesDoc): Promise<UpdateSeriesDTO> {
        const result: UpdateSeriesDTO = {
            id: series.id.toString(),
            title: series.title,
            description: series.description,
            image: {
                thumbnailUrl: series.image.thumbnailUrl,
                originalUrl: series.image.originalUrl,
            },

            ministers: series.ministers.map((minister) => ({
                id: minister.id,
                ministerialName: minister.ministerialName,
            })),
            sermons: series.sermons.map((sermon) => ({
                id: sermon.id,
                title: sermon.title,
            })),
            ownerId: {
                id: series.ownerId.id,
                ministerialName: series.ownerId.ministerialName,
            },

            status: series.status,
            totalDuration: series.totalDuration,
            numberOfSermons: series.numberOfSermons,

            topic: series.topic,
            tags: series.tags,
            isPublic: series.isPublic,
        };

        return result;
    }

    public async mapUploadSeriesImage(series: ISeriesDoc): Promise<UploadDTO> {
        const result: UploadDTO = {
            id: series.image.uploadId,
            uploadRef: series.image.uploadId,
            uploadedBy: series.image.uploadedBy,
            file: series.image.thumbnailUrl,
        };

        return result;
    }
}

export default new SeriesMapper();
