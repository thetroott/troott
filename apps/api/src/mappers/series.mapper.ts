import { UploadDTO } from '@/dtos/core/sermon.dto';
import { SeriesDTO, UpdateSeriesDTO } from '@/dtos/core/series.dto';
import { ISeriesDoc } from '@/interfaces/core/series.interface';
import type IMinisterDoc from '@/interfaces/core/minister.interface';
import type ISermonDoc from '@/interfaces/core/sermon.interface';
import { toStoragePublicUrl } from '@/utils/helpers.util';

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
        let bannerDto: { item: string; width: number; height: number } | undefined;
        if (banner) {
            bannerDto = {
                item: toStoragePublicUrl(banner.item),
                width: banner.width,
                height: banner.height,
            };
        } else {
            bannerDto = undefined;
        }

        const result: Partial<SeriesDTO> = {
            id: series.id.toString(),
            title: series.title,
            description: series.description,
            banner: bannerDto,

            ministers: series.ministers.map((minister: IMinisterDoc) => {
                let name = '';
                if (minister.profile?.ministerialName) {
                    name = minister.profile.ministerialName;
                }
                return {
                    id: String(minister.id),
                    name,
                };
            }),

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
        let bannerDto: { item: string; width: number; height: number } | undefined;
        if (series.banner) {
            bannerDto = {
                item: toStoragePublicUrl(series.banner.item),
                width: series.banner.width,
                height: series.banner.height,
            };
        } else {
            bannerDto = undefined;
        }

        let sermonIds: string[] = [];
        const rawSermons = (series as any).sermons;
        if (Array.isArray(rawSermons)) {
            sermonIds = rawSermons.map((sermon: ISermonDoc) => String(sermon.id));
        }

        const result: UpdateSeriesDTO = {
            title: series.title,
            description: series.description,
            banner: bannerDto,

            ministers: series.ministers.map((minister: IMinisterDoc) => String(minister.id)),
            sermons: sermonIds,

            status: series.status,

            topic: series.topic,
            tags: series.tags,
            isPublic: series.isPublic,
        };

        return result;
    }

    public async mapUploadSeriesImage(series: ISeriesDoc): Promise<UploadDTO> {
        const banner = series.banner;
        let itemId = '';
        if (banner?.itemId != null) {
            itemId = String(banner.itemId);
        }
        let uploadedBy = '';
        if (banner?.uploadedBy != null) {
            uploadedBy = String(banner.uploadedBy);
        }
        let file = '';
        if (banner?.item != null) {
            file = toStoragePublicUrl(String(banner.item));
        }
        const result: UploadDTO = {
            id: itemId,
            uploadRef: itemId,
            uploadedBy,
            file,
        };

        return result;
    }
}

export default new SeriesMapper();
