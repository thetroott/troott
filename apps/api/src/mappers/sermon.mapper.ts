import {
    SermonDTO,
    SermonPlaybackDTO,
    UpdateSermonDTO,
    UploadDTO,
} from '@/dtos/core/sermon.dto';
import { toStoragePublicUrl } from '@/utils/helpers.util';
import type { ISermonDoc } from '@/interfaces/core/sermon.interface';
import { SermonVisibilityStatus } from '@/interfaces/core/sermon.interface';

function sermonDocId(sermon: ISermonDoc): string {
    if (sermon.id != null) {
        return String(sermon.id);
    }
    if (sermon._id != null) {
        return String(sermon._id);
    }
    return '';
}

function ministerRefToId(m: any): string {
    if (m?._id != null) {
        return String(m._id);
    }
    if (m?.id != null) {
        return String(m.id);
    }
    if (m != null && m !== '') {
        return String(m);
    }
    return '';
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
        const audio = sermon.item;
        let item = '';
        let duration = 0;
        let size = 0;
        if (audio) {
            if (audio.item != null) {
                item = audio.item;
            }
            if (audio.duration != null) {
                duration = audio.duration;
            }
            if (audio.size != null) {
                size = audio.size;
            }
        }

        const result: SermonPlaybackDTO = {
            id: sermonDocId(sermon),
            sermon: {
                item,
                duration,
                size,
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
        let itemId = '';
        if (img?.itemId != null) {
            itemId = String(img.itemId);
        }
        let uploadedBy = '';
        if (img?.uploadedBy != null) {
            uploadedBy = String(img.uploadedBy);
        }
        let file = '';
        if (sermon.imageUrl != null && String(sermon.imageUrl).trim()) {
            file = toStoragePublicUrl(String(sermon.imageUrl));
        }
        const result: UploadDTO = {
            id: itemId,
            uploadRef: itemId,
            uploadedBy,
            file,
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
        let itemId = '';
        if (audio?.itemId != null) {
            itemId = String(audio.itemId);
        }
        let uploadedBy = '';
        if (audio?.uploadedBy != null) {
            uploadedBy = String(audio.uploadedBy);
        }

        let file = '';
        if (sermon.manifestUrl) {
            file = sermon.manifestUrl;
        } else if (sermon.playbackUrl) {
            file = sermon.playbackUrl;
        } else if (audio?.item != null) {
            file = audio.item;
        }

        const result: UploadDTO = {
            id: itemId,
            uploadRef: itemId,
            uploadedBy,
            file,
        };

        return result;
    }

    public async mapSermonUpdate(sermon: ISermonDoc): Promise<UpdateSermonDTO> {
        const audio = sermon.item;
        const img = sermon.image;
        const sr = sermon.series as
            | { _id?: unknown; id?: unknown; title?: string }
            | undefined;

        let seriesId: string | undefined;
        if (sr) {
            if (sr._id != null) {
                seriesId = String(sr._id);
            } else if (sr.id != null) {
                seriesId = String(sr.id);
            } else {
                seriesId = undefined;
            }
        } else {
            seriesId = undefined;
        }

        let sermonAudio: { item: string; duration: number; size: number } | undefined;
        if (audio) {
            sermonAudio = {
                item: audio.item,
                duration: audio.duration,
                size: audio.size,
            };
        } else {
            sermonAudio = undefined;
        }

        let imageDto: { item: string; width: number; height: number } | undefined;
        if (img) {
            imageDto = {
                item: img.item ?? '',
                width: img.width,
                height: img.height,
            };
        } else {
            imageDto = undefined;
        }

        let ministerIds: string[] | undefined;
        if (sermon.minister?.map) {
            ministerIds = sermon.minister.map((m: any) => ministerRefToId(m));
        } else {
            ministerIds = undefined;
        }

        let preachedYear = '';
        if (sermon.preachedYear != null) {
            preachedYear = String(sermon.preachedYear);
        }

        const result: UpdateSermonDTO = {
            title: sermon.title,
            description: sermon.description,
            preachedAt: sermon.preachedAt ?? '',
            preachedYear,

            topic: sermon.topic,
            tags: sermon.tags,
            isPublic: sermon.isPublic,
            visibility: (() => {
                const validVisibility = new Set<string>(
                    Object.values(SermonVisibilityStatus),
                );
                if (
                    typeof sermon.visibility === 'string' &&
                    validVisibility.has(sermon.visibility)
                ) {
                    return sermon.visibility as SermonVisibilityStatus;
                }
                if (sermon.isPublic === true) {
                    return SermonVisibilityStatus.PUBLIC;
                }
                if (sermon.isPublic === false) {
                    return SermonVisibilityStatus.PRIVATE;
                }
                return SermonVisibilityStatus.PUBLIC;
            })(),
            allowDownload: sermon.allowDownload,
            allowComment: sermon.allowComment,

            isSeries: sermon.isSeries,
            series: seriesId,

            sermon: sermonAudio,
            image: imageDto,
            minister: ministerIds,

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

        let duration = 0;
        if (sermon.duration != null) {
            duration = sermon.duration;
        } else if (audio?.duration != null) {
            duration = audio.duration;
        }

        let imageDto: { item: string; width: number; height: number } | undefined;
        if (img) {
            imageDto = {
                item: img.item ?? '',
                width: img.width,
                height: img.height,
            };
        } else {
            imageDto = undefined;
        }

        const ministers =
            sermon.minister?.map?.((m: any) => {
                let name = '';
                if (m.profile?.ministerialName) {
                    name = m.profile.ministerialName;
                } else if (m.ministerialName) {
                    name = m.ministerialName;
                }
                return {
                    id: ministerRefToId(m),
                    name,
                };
            }) ?? undefined;

        let shareableUrl = '';
        if (sermon.shareableUrl) {
            shareableUrl = sermon.shareableUrl;
        }

        const uploadRef =
            audio?.itemId != null ? String(audio.itemId) : undefined;

        const result: Partial<SermonDTO> = {
            id: String(sermon._id),
            ...(uploadRef ? { uploadRef } : {}),

            title: sermon.title,
            description: sermon.description,
            duration,

            playbackUrl: sermon.playbackUrl ?? '',
            manifestUrl: sermon.manifestUrl ?? '',
            imageUrl: toStoragePublicUrl(sermon.imageUrl ?? ''),

            image: imageDto,
            item: audio
                ? {
                      item: audio.item,
                      duration: audio.duration,
                      size: audio.size,
                      fileType: audio.fileType,
                      mimetype: audio.mimetype,
                      itemId: audio.itemId,
                      uploadStatus: audio.uploadStatus,
                  }
                : undefined,
            minister: ministers,

            topic: sermon.topic,
            tags: sermon.tags,
            isPublic: sermon.isPublic,
            visibility: (() => {
                const validVisibility = new Set<string>(
                    Object.values(SermonVisibilityStatus),
                );
                if (
                    typeof sermon.visibility === 'string' &&
                    validVisibility.has(sermon.visibility)
                ) {
                    return sermon.visibility as SermonVisibilityStatus;
                }
                if (sermon.isPublic === true) {
                    return SermonVisibilityStatus.PUBLIC;
                }
                if (sermon.isPublic === false) {
                    return SermonVisibilityStatus.PRIVATE;
                }
                return SermonVisibilityStatus.PUBLIC;
            })(),
            preachedAt: sermon.preachedAt ?? '',
            preachedYear: sermon.preachedYear,
            shareableUrl,
            status: sermon.status,
            isPublished: sermon.isPublished,
        };

        return result;
    }
}

export default new SermonMapper();
