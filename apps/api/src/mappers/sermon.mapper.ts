import {
    SermonDTO,
    SermonPlaybackDTO,
    UpdateSermonDTO,
    UploadDTO,
} from '@/dtos/core/sermon.dto';
import type { ISermonDoc } from '@/interfaces/core/sermon.interface';

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
        const audio = sermon.item;
        const result: SermonPlaybackDTO = {
            id: String(sermon.id ?? sermon._id),
            sermon: {
                item: audio?.item ?? '',
                duration: audio?.duration ?? 0,
                size: audio?.size ?? 0,
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
        const img = sermon.image;
        const result: UploadDTO = {
            id: img?.itemId ?? '',
            uploadRef: img?.itemId ?? '',
            uploadedBy:
                img?.uploadedBy != null ? String(img.uploadedBy) : '',
            file: img?.item ?? '',
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
        const audio = sermon.item;
        const result: UploadDTO = {
            id: audio?.itemId ?? '',
            uploadRef: audio?.itemId ?? '',
            uploadedBy: audio?.uploadedBy != null ? String(audio.uploadedBy) : '',
            file:
                sermon.manifestUrl ??
                sermon.playbackUrl ??
                audio?.item ??
                '',
        };

        return result;
    }

    //mapSermonUpload
    public async mapSermonUpdate(sermon: ISermonDoc): Promise<UpdateSermonDTO> {
        const audio = sermon.item;
        const img = sermon.image;
        const sr = sermon.series as { _id?: unknown; id?: unknown; title?: string } | undefined;

        const result: UpdateSermonDTO = {
            id: String(sermon.id ?? sermon._id),
            title: sermon.title,
            description: sermon.description,
            preachedAt: sermon.preachedAt ?? '',
            preachedYear: String(sermon.preachedYear ?? ''),

            topic: sermon.topic,
            tags: sermon.tags,
            isPublic: sermon.isPublic,
            allowDownload: sermon.allowDownload,
            allowComment: sermon.allowComment,

            isSeries: sermon.isSeries,
            series: sr
                ? String(sr._id ?? sr.id ?? '')
                : undefined,

            sermon: audio
                ? { item: audio.item, duration: audio.duration, size: audio.size }
                : undefined,
            image: img
                ? { item: img.item, width: img.width, height: img.height }
                : undefined,
            minister: sermon.minister?.map?.((m: any) => String(m._id ?? m.id ?? m)),

            status: sermon.status,
            isPublished: sermon.isPublished,
            publishedBy: sermon.publishedBy as unknown as string,
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
    public async mapSermon(sermon: ISermonDoc): Promise<Partial<SermonDTO>> {
        const audio = sermon.item;
        const img = sermon.image;

        const result: Partial<SermonDTO> = {
            id: String(sermon._id),

            title: sermon.title,
            description: sermon.description,
            duration: sermon.duration ?? audio?.duration ?? 0,

            image: img
                ? { item: img.item, width: img.width, height: img.height }
                : undefined,
            minister: sermon.minister?.map?.((m: any) => ({
                id: String(m._id ?? m.id ?? ''),
                name: m.profile?.ministerialName ?? m.ministerialName ?? '',
            })),

            topic: sermon.topic,
            tags: sermon.tags,
            isPublic: sermon.isPublic,
            preachedAt: sermon.preachedAt ?? '',
            preachedYear: sermon.preachedYear,
            shareableUrl: sermon.shareableUrl ?? '',
        };

        return result;
    }
}

export default new SermonMapper();
