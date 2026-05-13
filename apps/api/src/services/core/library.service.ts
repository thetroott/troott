import libraryRepository from '@/repository/core/library.repository';
import { IResult } from '@/interfaces/common.interface';
import type { ILibraryDoc } from '@/interfaces/core/library.interface';
import { LibraryItemType } from '@/interfaces/core/library.interface';
import {
    AddLibraryItemDTO,
    RemoveLibraryItemDTO,
    UpdateLibraryItemFlagsDTO,
} from '@/dtos/core/library.dto';
import { generateRandomChars } from '@/utils/helpers.util';

class LibraryService {
    public result: IResult;

    constructor() {
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    public async getOrCreateLibrary(listenerId: string): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const existing = await libraryRepository.findByListener(listenerId);
        if (!existing.error && existing.data) {
            result.data = existing.data;
            return result;
        }

        const created = await libraryRepository.createLibrary({
            code: `lib-${generateRandomChars(8)}`,
            slug: `library-${listenerId}`,
            listener: listenerId,
            items: [],
            sermonCount: 0,
            playlistCount: 0,
            seriesCount: 0,
            ministerCount: 0,
            syncVersion: 0,
        } as Partial<ILibraryDoc>);

        if (created.error) {
            result.error = true;
            result.message = created.message;
            result.code = created.code;
            return result;
        }

        result.data = created.data;
        result.code = 201;
        return result;
    }

    public async addItem(
        listenerId: string,
        dto: AddLibraryItemDTO,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const libraryResult = await this.getOrCreateLibrary(listenerId);
        if (libraryResult.error) return libraryResult;

        const library = libraryResult.data as ILibraryDoc;

        const duplicate = library.items.find(
            (item) =>
                item.id === dto.itemId && item.type === dto.type,
        );
        if (duplicate) {
            result.error = true;
            result.message = 'Item already saved in library';
            result.code = 409;
            return result;
        }

        const refField = this.getRefField(dto.type);
        const newItem: any = {
            id: dto.itemId,
            type: dto.type,
            [refField]: dto.itemId,
            addedAt: new Date().toISOString(),
            addedFrom: dto.addedFrom,
            sortOrder: library.items.length,
            flags: {
                liked: false,
                downloaded: false,
                pinned: false,
                favourite: false,
            },
        };

        const countField = this.getCountField(dto.type);
        const update = await libraryRepository.pushItem(
            String(library._id),
            newItem,
            countField,
        );

        if (update.error) {
            result.error = true;
            result.message = update.message;
            result.code = update.code;
            return result;
        }

        result.data = update.data;
        result.message = 'Item added to library';
        return result;
    }

    public async removeItem(
        listenerId: string,
        dto: RemoveLibraryItemDTO,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const libraryResult = await this.getOrCreateLibrary(listenerId);
        if (libraryResult.error) return libraryResult;

        const library = libraryResult.data as ILibraryDoc;

        const exists = library.items.find(
            (item) => item.id === dto.itemId && item.type === dto.type,
        );
        if (!exists) {
            result.error = true;
            result.message = 'Item not found in library';
            result.code = 404;
            return result;
        }

        const countField = this.getCountField(dto.type);
        const update = await libraryRepository.pullItem(
            String(library._id),
            dto.itemId,
            dto.type,
            countField,
        );

        if (update.error) {
            result.error = true;
            result.message = update.message;
            result.code = update.code;
            return result;
        }

        result.data = update.data;
        result.message = 'Item removed from library';
        return result;
    }

    public async updateItemFlags(
        listenerId: string,
        dto: UpdateLibraryItemFlagsDTO,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const libraryResult = await this.getOrCreateLibrary(listenerId);
        if (libraryResult.error) return libraryResult;

        const library = libraryResult.data as ILibraryDoc;

        const exists = library.items.find(
            (item) => item.id === dto.itemId && item.type === dto.type,
        );
        if (!exists) {
            result.error = true;
            result.message = 'Item not found in library';
            result.code = 404;
            return result;
        }

        const update = await libraryRepository.updateItemFlags(
            String(library._id),
            dto.itemId,
            dto.type,
            dto.flags,
        );

        if (update.error) {
            result.error = true;
            result.message = update.message;
            result.code = update.code;
            return result;
        }

        result.data = update.data;
        result.message = 'Item flags updated';
        return result;
    }

    public async getItems(
        listenerId: string,
        options: {
            type?: LibraryItemType;
            limit?: number;
            skip?: number;
            sort?: 'recent' | 'oldest' | 'custom';
        } = {},
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const libraryResult = await this.getOrCreateLibrary(listenerId);
        if (libraryResult.error) return libraryResult;

        const library = libraryResult.data as ILibraryDoc;
        let items = [...library.items];

        if (options.type) {
            items = items.filter((item) => item.type === options.type);
        }

        if (options.sort === 'recent') {
            items.sort(
                (a, b) =>
                    new Date(b.addedAt).getTime() -
                    new Date(a.addedAt).getTime(),
            );
        } else if (options.sort === 'oldest') {
            items.sort(
                (a, b) =>
                    new Date(a.addedAt).getTime() -
                    new Date(b.addedAt).getTime(),
            );
        } else {
            items.sort((a, b) => a.sortOrder - b.sortOrder);
        }

        const skip = options.skip || 0;
        const limit = options.limit || 25;
        const paged = items.slice(skip, skip + limit);

        result.data = {
            items: paged,
            total: items.length,
            sermonCount: library.sermonCount,
            playlistCount: library.playlistCount,
            seriesCount: library.seriesCount,
            ministerCount: library.ministerCount,
        };

        return result;
    }

    public async isSaved(
        listenerId: string,
        itemId: string,
        type: LibraryItemType,
    ): Promise<boolean> {
        const libraryResult = await this.getOrCreateLibrary(listenerId);
        if (libraryResult.error) return false;

        const library = libraryResult.data as ILibraryDoc;
        return library.items.some(
            (item) => item.id === itemId && item.type === type,
        );
    }

    public async getSavedSermons(
        listenerId: string,
        limit = 25,
        skip = 0,
    ): Promise<IResult> {
        return this.getItems(listenerId, {
            type: LibraryItemType.SERMON,
            limit,
            skip,
            sort: 'recent',
        });
    }

    public async getSavedSeries(
        listenerId: string,
        limit = 25,
        skip = 0,
    ): Promise<IResult> {
        return this.getItems(listenerId, {
            type: LibraryItemType.SERIES,
            limit,
            skip,
            sort: 'recent',
        });
    }

    public async getSavedPlaylists(
        listenerId: string,
        limit = 25,
        skip = 0,
    ): Promise<IResult> {
        return this.getItems(listenerId, {
            type: LibraryItemType.PLAYLIST,
            limit,
            skip,
            sort: 'recent',
        });
    }

    public async getFollowedMinisters(
        listenerId: string,
        limit = 25,
        skip = 0,
    ): Promise<IResult> {
        return this.getItems(listenerId, {
            type: LibraryItemType.MINISTER,
            limit,
            skip,
            sort: 'recent',
        });
    }

    private getRefField(type: LibraryItemType): string {
        const map: Record<LibraryItemType, string> = {
            [LibraryItemType.SERMON]: 'sermon',
            [LibraryItemType.PLAYLIST]: 'playlist',
            [LibraryItemType.SERIES]: 'series',
            [LibraryItemType.MINISTER]: 'minister',
        };
        return map[type];
    }

    private getCountField(type: LibraryItemType): string {
        const map: Record<LibraryItemType, string> = {
            [LibraryItemType.SERMON]: 'sermonCount',
            [LibraryItemType.PLAYLIST]: 'playlistCount',
            [LibraryItemType.SERIES]: 'seriesCount',
            [LibraryItemType.MINISTER]: 'ministerCount',
        };
        return map[type];
    }
}

export default new LibraryService();
