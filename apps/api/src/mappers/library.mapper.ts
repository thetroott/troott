import type {
    LibraryItemResponseDTO,
    LibraryResponseDTO,
} from '@/dtos/core/library.dto';
import type ILibraryDoc from '@/interfaces/core/library.interface';
import {
    LibraryItemAddedFrom,
    LibraryItemType,
} from '@/interfaces/core/library.interface';
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

const mapLibraryItem = (row: any): LibraryItemResponseDTO => {
    const type = row.type as LibraryItemType;
    let ref: any;

    if (type === LibraryItemType.SERMON) {
        ref = row.sermon;
    } else if (type === LibraryItemType.PLAYLIST) {
        ref = row.playlist;
    } else if (type === LibraryItemType.SERIES) {
        ref = row.series;
    } else if (type === LibraryItemType.MINISTER) {
        ref = row.minister;
    } else {
        ref = null;
    }

    let title = '';
    if (ref?.title) {
        title = ref.title;
    } else if (ref?.name) {
        title = ref.name;
    } else {
        const fromName = `${ref?.firstName ?? ''} ${ref?.lastName ?? ''}`.trim();
        if (fromName) {
            title = fromName;
        }
    }

    let imageUrl: string | undefined;
    if (ref?.imageUrl) {
        imageUrl = toStoragePublicUrl(ref.imageUrl);
    } else if (typeof ref?.banner === 'string') {
        imageUrl = toStoragePublicUrl(ref.banner);
    } else if (ref?.banner?.item) {
        imageUrl = toStoragePublicUrl(ref.banner.item);
    } else if (ref?.avatar) {
        imageUrl =
            typeof ref.avatar === 'string'
                ? toStoragePublicUrl(ref.avatar)
                : toStoragePublicUrl(ref.avatar?.s3Key);
    } else if (ref?.profile?.ministryLogo) {
        imageUrl = toStoragePublicUrl(ref.profile.ministryLogo);
    }

    let duration: number | undefined;
    if (ref?.duration != null) {
        duration = ref.duration;
    } else if (ref?.totalDuration != null) {
        duration = ref.totalDuration;
    } else {
        duration = undefined;
    }

    let rowId = '';
    if (row.id != null && row.id !== '') {
        rowId = row.id;
    } else if (idOf(ref)) {
        rowId = idOf(ref);
    }

    return {
        id: rowId,
        type,
        item: {
            id: idOf(ref),
            title,
            imageUrl,
            duration,
        },
        addedAt: row.addedAt ?? '',
        addedFrom: (row.addedFrom ?? LibraryItemAddedFrom.MANUAL) as LibraryItemAddedFrom,
        sortOrder: row.sortOrder ?? 0,
        flags: {
            liked: Boolean(row.flags?.liked),
            downloaded: Boolean(row.flags?.downloaded),
            pinned: Boolean(row.flags?.pinned),
            favourite: Boolean(row.flags?.favourite),
        },
    };
};

class LibraryMapper {
    public async mapLibraryResponse(
        library: ILibraryDoc,
    ): Promise<LibraryResponseDTO> {
        const lib = library as any;

        return {
            id: idOf(library),
            code: lib.code ?? '',
            sermonCount: lib.sermonCount ?? 0,
            playlistCount: lib.playlistCount ?? 0,
            seriesCount: lib.seriesCount ?? 0,
            ministerCount: lib.ministerCount ?? 0,
            items: (lib.items ?? []).map((it: any) => mapLibraryItem(it)),
            lastSyncedAt: lib.lastSyncedAt ?? '',
            syncVersion: lib.syncVersion ?? 0,
        };
    }
}

export default new LibraryMapper();
