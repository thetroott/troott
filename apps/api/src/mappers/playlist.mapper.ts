import type {
    PlaylistItemDTO,
    PlaylistResponseDTO,
} from '@/dtos/core/playlist.dto';
import type { IPlaylistDoc } from '@/interfaces/core/playlist.interface';
import { PlaylistItemResourceType } from '@/interfaces/core/playlist.interface';
import type ISermonDoc from '@/interfaces/core/sermon.interface';
import type ISeriesDoc from '@/interfaces/core/series.interface';
import type IUserDoc from '@/interfaces/user.interface';
import { toStoragePublicUrl } from '@/utils/helpers.util';

const idOf = (doc: unknown): string => {
    if (doc == null) {
        return '';
    }
    const d = doc as { _id?: unknown; id?: unknown };
    if (d._id != null) {
        return String(d._id);
    }
    if (d.id != null) {
        return String(d.id);
    }
    return '';
};

const userDisplayName = (u: IUserDoc | any): string => {
    if (!u) {
        return '';
    }
    const fromName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    if (fromName) {
        return fromName;
    }
    if (u.email) {
        return u.email;
    }
    return '';
};

const ministerDisplayName = (m: any): string => {
    if (!m) {
        return '';
    }
    if (m.profile?.ministerialName) {
        return m.profile.ministerialName;
    }
    if (m.ministerialName) {
        return m.ministerialName;
    }
    return `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim();
};

const mapPlaylistItem = (row: any): PlaylistItemDTO => {
    const raw = row.item;
    const sermon = raw as ISermonDoc | undefined;
    const series = raw as ISeriesDoc | undefined;

    let title = '';
    let imageUrl: string | undefined;
    let duration: number | undefined;
    let minister: string | undefined;

    if (sermon?.title != null) {
        title = sermon.title;
        imageUrl = toStoragePublicUrl(sermon.imageUrl);
        duration = sermon.duration;
        let m: unknown;
        if (Array.isArray(sermon.minister)) {
            m = sermon.minister[0];
        } else {
            m = sermon.minister;
        }
        minister = ministerDisplayName(m);
    } else if (series?.title != null) {
        title = series.title;
        const b = series.banner as { item?: string } | undefined;
        if (typeof series.banner === 'string') {
            imageUrl = toStoragePublicUrl(series.banner);
        } else {
            imageUrl = toStoragePublicUrl(b?.item);
        }
        duration = series.totalDuration;
        let m: unknown;
        if (Array.isArray(series.ministers)) {
            m = series.ministers[0];
        } else {
            m = series.ministers;
        }
        minister = ministerDisplayName(m);
    } else if (raw && typeof raw === 'object') {
        title = (raw as { title?: string }).title ?? '';
        imageUrl = toStoragePublicUrl((raw as { imageUrl?: string }).imageUrl);
        duration = (raw as { duration?: number }).duration;
    }

    const itemType =
        row.itemType === PlaylistItemResourceType.SERIES
            ? PlaylistItemResourceType.SERIES
            : PlaylistItemResourceType.SERMON;

    return {
        id: idOf(row._id ?? row.id ?? raw),
        itemType,
        item: {
            id: idOf(raw),
            title,
            imageUrl,
            duration,
            minister,
        },
        position: row.position ?? 0,
        addedAt: row.addedAt ?? '',
    };
};

class PlaylistMapper {
    public async mapPlaylistResponse(
        playlist: IPlaylistDoc,
    ): Promise<PlaylistResponseDTO> {
        const p = playlist as any;

        const owner = p.owner as IUserDoc | undefined;
        const listener = p.listener as any;
        const minister = p.minister as any;

        let ownerDto: { id: string; name: string } | undefined;
        if (owner) {
            ownerDto = { id: idOf(owner), name: userDisplayName(owner) };
        } else {
            ownerDto = undefined;
        }

        let listenerDto: { id: string; name: string } | undefined;
        if (listener) {
            listenerDto = {
                id: idOf(listener),
                name: `${listener.firstName ?? ''} ${listener.lastName ?? ''}`.trim(),
            };
        } else {
            listenerDto = undefined;
        }

        let ministerDto: { id: string; name: string } | undefined;
        if (minister) {
            ministerDto = {
                id: idOf(minister),
                name: ministerDisplayName(minister),
            };
        } else {
            ministerDto = undefined;
        }

        return {
            id: idOf(playlist),
            code: p.code ?? '',
            slug: p.slug ?? '',
            title: p.title ?? '',
            description: p.description ?? '',
            banner: toStoragePublicUrl(p.banner ?? ''),

            items: (p.items ?? []).map((it: any) => mapPlaylistItem(it)),
            itemsCount: p.itemsCount ?? (p.items?.length ?? 0),
            totalDurationMs: p.totalDurationMs ?? 0,

            status: p.status,
            visibility: p.visibility,
            playlistType: p.playlistType,
            ownerType: p.ownerType,

            owner: ownerDto,
            listener: listenerDto,
            minister: ministerDto,

            isCollaborative: Boolean(p.isCollaborative),

            likesCount: p.likesCount ?? 0,
            savesCount: p.savesCount ?? 0,
            followersCount: p.followersCount ?? 0,
            sharesCount: p.sharesCount ?? 0,
            playsCount: p.playsCount ?? 0,

            isPublic: Boolean(p.isPublic),
            isFeatured: Boolean(p.isFeatured),
            isPinned: Boolean(p.isPinned),

            tags: p.tags ?? [],
            genres: p.genres ?? [],
            languages: p.languages ?? [],

            createdAt: p.createdAt ?? '',
            updatedAt: p.updatedAt ?? '',
        };
    }
}

export default new PlaylistMapper();
