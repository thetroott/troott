import { UploadDTO } from '@/dtos/core/sermon.dto';
import { SeriesDTO, UpdateSeriesDTO } from '@/dtos/core/series.dto';
import { ISeriesDoc } from '@/interfaces/core/series.interface';
import type IMinisterDoc from '@/interfaces/core/minister.interface';
import type ISermonDoc from '@/interfaces/core/sermon.interface';

class SeriesMapper {
    constructor() {}

    /**
     * @name mapSeriesDTO
     * @param series
     * @returns SeriesDTO
     * @description Converts a series document into a DTO for API responses.
     */
    public async mapSeriesDTO(series: ISeriesDoc): Promise<Partial<SeriesDTO>> {
        const banner = series.banner;
        const result: Partial<SeriesDTO> = {
            id: series.id.toString(),
            title: series.title,
            description: series.description,
            banner: banner
                ? { item: banner.item, width: banner.width, height: banner.height }
                : undefined,

            ministers: series.ministers.map((minister: IMinisterDoc) => ({
                id: String(minister.id),
                name: minister.profile?.ministerialName ?? '',
            })),

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
            title: series.title,
            description: series.description,
            banner: series.banner
                ? { item: series.banner.item, width: series.banner.width, height: series.banner.height }
                : undefined,

            ministers: series.ministers.map((minister: IMinisterDoc) => String(minister.id)),
            sermons: (series as any).sermons?.map((sermon: ISermonDoc) => String(sermon.id)) ?? [],

            status: series.status,

            topic: series.topic,
            tags: series.tags,
            isPublic: series.isPublic,
        };

        return result;
    }

    public async mapUploadSeriesImage(series: ISeriesDoc): Promise<UploadDTO> {
        const banner = series.banner;
        const result: UploadDTO = {
            id: banner?.itemId ?? '',
            uploadRef: banner?.itemId ?? '',
            uploadedBy: banner?.uploadedBy != null ? String(banner.uploadedBy) : '',
            file: banner?.item ?? '',
        };

        return result;
    }
}

export default new SeriesMapper();
