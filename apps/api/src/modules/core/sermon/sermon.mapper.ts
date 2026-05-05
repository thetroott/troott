import {
    SermonDTO,
    SermonPlaybackDTO,
    UpdateSermonDTO,
    UploadDTO,
} from './sermon.dto';
import type { ISermonDoc } from './sermon.interface';
import type { IMinisterDoc, ISeriesDoc } from '@/utils/interfaces.util';

function ministerPayload(minister: unknown): Partial<IMinisterDoc> {
    if (minister == null) return {};
    const m = minister as {
        _id?: unknown;
        id?: unknown;
        ministerialName?: string;
    };
    const id = m._id ?? m.id;
    return {
        id: id as Partial<IMinisterDoc>['id'],
        ministerialName: m.ministerialName,
    };
}

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
        const audio = sermon.sermon;
        const result: SermonPlaybackDTO = {
            id: String(sermon.id ?? sermon._id),
            sermon: {
                cdnUrl: audio?.cdnUrl ?? '',
                originalUrl: audio?.originalUrl ?? '',
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
            id: img?.uploadId ?? '',
            uploadRef: img?.uploadId ?? '',
            uploadedBy:
                img?.uploadedBy != null ? String(img.uploadedBy) : '',
            file: img?.thumbnailUrl ?? '',
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
        const sum = sermon.uploadSummary as
            | {
                  uploadId?: string;
                  uploadedBy?: { toString(): string };
                  rawFile?: string;
              }
            | undefined;
        const result: UploadDTO = {
            id: sum?.uploadId ?? '',
            uploadRef: sum?.uploadId ?? '',
            uploadedBy: sum?.uploadedBy?.toString() ?? '',
            file:
                sum?.rawFile ??
                sermon.hlsMasterUrl ??
                sermon.sermonUrl ??
                '',
        };

        return result;
    }

    //mapSermonUpload
    public async mapSermonUpdate(sermon: ISermonDoc): Promise<UpdateSermonDTO> {
        const audio = sermon.sermon;
        const img = sermon.image;
        const sr = sermon.series as { _id?: unknown; id?: unknown; title?: string } | undefined;

        const result: UpdateSermonDTO = {
            id: String(sermon.id ?? sermon._id),
            title: sermon.title,
            description: sermon.description,
            shareableUrl: audio?.shareableUrl ?? sermon.shareableUrl,
            releaseDate: sermon.releaseDate?.toISOString?.() ?? '',
            releaseYear: String(sermon.releaseYear ?? ''),

            topic: sermon.topic,
            tags: sermon.tags,
            isPublic: sermon.isPublic,
            allowDownload: sermon.allowDownload,
            allowComment: sermon.allowComment,

            isSeries: sermon.isSeries,
            seriesId: sr
                ? ({
                      _id: sr._id ?? sr.id,
                      title: sr.title ?? '',
                  } as Partial<ISeriesDoc>)
                : undefined,

            sermon: {
                cdnUrl: audio?.cdnUrl,
                originalUrl: audio?.originalUrl,
            },
            image: {
                thumbnailUrl: img?.thumbnailUrl,
                originalUrl: img?.originalUrl,
            },
            minister: ministerPayload(sermon.minister),

            status: sermon.status,
            state: sermon.state,
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
    public async mapSermon(sermon: ISermonDoc): Promise<SermonDTO> {
        const audio = sermon.sermon;
        const img = sermon.image;

        const result: SermonDTO = {
            id: String(sermon._id),

            title: sermon.title,
            description: sermon.description,
            duration: sermon.duration ?? audio?.duration ?? 0,

            image: {
                thumbnailUrl: img?.thumbnailUrl ?? '',
                originalUrl: img?.originalUrl ?? '',
            },
            minister: ministerPayload(sermon.minister),

            topic: sermon.topic,
            tags: sermon.tags,
            isPublic: sermon.isPublic,
            releaseDate: sermon.releaseDate?.toISOString?.() ?? '',
            releaseYear: sermon.releaseYear,
            shareableUrl: audio?.shareableUrl ?? sermon.shareableUrl ?? '',
        };

        return result;
    }
}

export default new SermonMapper();
