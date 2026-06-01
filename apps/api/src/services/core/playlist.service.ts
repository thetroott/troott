import playlistRepository from '@/repository/core/playlist.repository';
import { IResult } from '@/interfaces/common.interface';
import type { IPlaylistDoc } from '@/interfaces/core/playlist.interface';
import {
    PlaylistStatus,
    PlaylistVisibility,
    PlaylistOwnerType,
} from '@/interfaces/core/playlist.interface';
import {
    CreatePlaylistDTO,
    UpdatePlaylistDTO,
    AddPlaylistItemDTO,
    RemovePlaylistItemDTO,
    ReorderPlaylistItemDTO,
} from '@/dtos/core/playlist.dto';
import { generateRandomChars, genSlug } from '@/utils/helpers.util';
import type { IUserDoc } from '@/interfaces/user.interface';

class PlaylistService {
    public result: IResult;

    constructor() {
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    public async createPlaylist(
        dto: CreatePlaylistDTO,
        user: IUserDoc,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 201,
            data: {},
        };

        const code = `pl-${generateRandomChars(8)}`;
        const slug = `${genSlug(dto.title)}-${code}`;

        const playlistData: Partial<IPlaylistDoc> = {
            code,
            slug,
            title: dto.title,
            description: dto.description || '',
            banner: dto.banner || '',
            items: [],
            itemsCount: 0,
            totalDurationMs: 0,
            status: PlaylistStatus.ACTIVE,
            visibility: dto.visibility || PlaylistVisibility.PUBLIC,
            playlistType: dto.playlistType,
            ownerType: dto.ownerType || PlaylistOwnerType.LISTENER,
            isCollaborative: dto.isCollaborative || false,
            collaborators: [],
            likesCount: 0,
            savesCount: 0,
            followersCount: 0,
            sharesCount: 0,
            playsCount: 0,
            isPublic: dto.visibility !== PlaylistVisibility.PRIVATE,
            isFeatured: false,
            isPinned: false,
            tags: dto.tags || [],
            genres: dto.genres || [],
            languages: dto.languages || [],
            user: user._id,
            createdBy: user._id,
        } as any;

        if (dto.ownerType === PlaylistOwnerType.LISTENER) {
            (playlistData as any).listener = user._id;
        } else if (dto.ownerType === PlaylistOwnerType.MINISTER) {
            (playlistData as any).minister = user._id;
        }

        const created = await playlistRepository.createPlaylist(playlistData);
        if (created.error) {
            result.error = true;
            result.message = created.message;
            result.code = created.code;
            return result;
        }

        result.data = created.data;
        result.message = 'Playlist created successfully';
        return result;
    }

    public async updatePlaylist(
        playlistId: string,
        dto: UpdatePlaylistDTO,
        userId: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const existing = await playlistRepository.findById(playlistId);
        if (existing.error) {
            result.error = true;
            result.message = 'Playlist not found';
            result.code = 404;
            return result;
        }

        const playlist = existing.data as IPlaylistDoc;
        if (String(playlist.user) !== userId && String(playlist.createdBy) !== userId) {
            result.error = true;
            result.message = 'Not authorized to update this playlist';
            result.code = 403;
            return result;
        }

        const updateData: Partial<IPlaylistDoc> = {};
        if (dto.title) {
            updateData.title = dto.title;
            updateData.slug = genSlug(dto.title);
        }
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.banner !== undefined) updateData.banner = dto.banner;
        if (dto.visibility) {
            updateData.visibility = dto.visibility;
            updateData.isPublic = dto.visibility !== PlaylistVisibility.PRIVATE;
        }
        if (dto.playlistType) updateData.playlistType = dto.playlistType;
        if (dto.isCollaborative !== undefined)
            updateData.isCollaborative = dto.isCollaborative;
        if (dto.tags) updateData.tags = dto.tags;
        if (dto.genres) updateData.genres = dto.genres;
        if (dto.languages) updateData.languages = dto.languages;

        const updated = await playlistRepository.updatePlaylist(
            playlistId,
            updateData,
        );
        if (updated.error) {
            result.error = true;
            result.message = updated.message;
            result.code = updated.code;
            return result;
        }

        result.data = updated.data;
        result.message = 'Playlist updated successfully';
        return result;
    }

    public async deletePlaylist(
        playlistId: string,
        userId: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const existing = await playlistRepository.findById(playlistId);
        if (existing.error) {
            result.error = true;
            result.message = 'Playlist not found';
            result.code = 404;
            return result;
        }

        const playlist = existing.data as IPlaylistDoc;
        if (String(playlist.user) !== userId && String(playlist.createdBy) !== userId) {
            result.error = true;
            result.message = 'Not authorized to delete this playlist';
            result.code = 403;
            return result;
        }

        const updated = await playlistRepository.updatePlaylist(playlistId, {
            status: PlaylistStatus.DELETED,
        } as Partial<IPlaylistDoc>);

        if (updated.error) {
            result.error = true;
            result.message = updated.message;
            result.code = updated.code;
            return result;
        }

        result.message = 'Playlist deleted successfully';
        result.data = updated.data;
        return result;
    }

    public async addItem(
        playlistId: string,
        dto: AddPlaylistItemDTO,
        userId: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const existing = await playlistRepository.findById(playlistId);
        if (existing.error) {
            result.error = true;
            result.message = 'Playlist not found';
            result.code = 404;
            return result;
        }

        const playlist = existing.data as IPlaylistDoc;

        const isOwner =
            String(playlist.user) === userId ||
            String(playlist.createdBy) === userId;
        const isCollaborator = playlist.collaborators?.some(
            (c: any) => String(c) === userId,
        );
        if (!isOwner && !isCollaborator && !playlist.isCollaborative) {
            result.error = true;
            result.message = 'Not authorized to add items to this playlist';
            result.code = 403;
            return result;
        }

        const duplicate = playlist.items.some(
            (item: any) =>
                String(item.item) === dto.itemId &&
                item.itemType === dto.itemType,
        );
        if (duplicate) {
            result.error = true;
            result.message = 'Item already in playlist';
            result.code = 409;
            return result;
        }

        const position =
            dto.position !== undefined ? dto.position : playlist.items.length;

        const newItem = {
            itemType: dto.itemType,
            item: dto.itemId,
            position,
            addedAt: new Date().toISOString(),
            addedBy: userId,
        };

        const updated = await playlistRepository.addItemToPlaylist(
            playlistId,
            newItem as any,
        );
        if (updated.error) {
            result.error = true;
            result.message = updated.message;
            result.code = updated.code;
            return result;
        }

        const updatedPlaylist = updated.data as IPlaylistDoc;
        await playlistRepository.updatePlaylist(playlistId, {
            itemsCount: updatedPlaylist.items.length,
        } as Partial<IPlaylistDoc>);

        result.data = updated.data;
        result.message = 'Item added to playlist';
        return result;
    }

    public async removeItem(
        playlistId: string,
        dto: RemovePlaylistItemDTO,
        userId: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const existing = await playlistRepository.findById(playlistId);
        if (existing.error) {
            result.error = true;
            result.message = 'Playlist not found';
            result.code = 404;
            return result;
        }

        const playlist = existing.data as IPlaylistDoc;
        const isOwner =
            String(playlist.user) === userId ||
            String(playlist.createdBy) === userId;
        if (!isOwner) {
            result.error = true;
            result.message = 'Not authorized to remove items from this playlist';
            result.code = 403;
            return result;
        }

        const updated = await playlistRepository.removeItemFromPlaylist(
            playlistId,
            dto.itemId,
        );
        if (updated.error) {
            result.error = true;
            result.message = updated.message;
            result.code = updated.code;
            return result;
        }

        const updatedPlaylist = updated.data as IPlaylistDoc;
        await playlistRepository.updatePlaylist(playlistId, {
            itemsCount: updatedPlaylist.items.length,
        } as Partial<IPlaylistDoc>);

        result.data = updated.data;
        result.message = 'Item removed from playlist';
        return result;
    }

    public async reorderItem(
        playlistId: string,
        dto: ReorderPlaylistItemDTO,
        userId: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const existing = await playlistRepository.findById(playlistId);
        if (existing.error) {
            result.error = true;
            result.message = 'Playlist not found';
            result.code = 404;
            return result;
        }

        const playlist = existing.data as IPlaylistDoc;
        if (String(playlist.user) !== userId && String(playlist.createdBy) !== userId) {
            result.error = true;
            result.message = 'Not authorized to reorder this playlist';
            result.code = 403;
            return result;
        }

        const items = [...playlist.items];
        const currentIndex = items.findIndex(
            (item: any) => String(item.item) === dto.itemId,
        );
        if (currentIndex === -1) {
            result.error = true;
            result.message = 'Item not found in playlist';
            result.code = 404;
            return result;
        }

        const [moved] = items.splice(currentIndex, 1) as any[];
        items.splice(dto.newPosition, 0, moved);

        const reordered = items.map((item: any, index: number) => ({
            ...item,
            position: index,
        }));

        const updated = await playlistRepository.updatePlaylist(playlistId, {
            items: reordered,
        } as Partial<IPlaylistDoc>);

        if (updated.error) {
            result.error = true;
            result.message = updated.message;
            result.code = updated.code;
            return result;
        }

        result.data = updated.data;
        result.message = 'Playlist reordered successfully';
        return result;
    }

    public async duplicatePlaylist(
        playlistId: string,
        user: IUserDoc,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 201,
            data: {},
        };

        const existing = await playlistRepository.findById(playlistId);
        if (existing.error) {
            result.error = true;
            result.message = 'Playlist not found';
            result.code = 404;
            return result;
        }

        const source = existing.data as IPlaylistDoc;

        const newPlaylist: Partial<IPlaylistDoc> = {
            code: `pl-${generateRandomChars(8)}`,
            slug: genSlug(`${source.title} copy`),
            title: `${source.title} (Copy)`,
            description: source.description,
            banner: source.banner,
            items: source.items.map((item: any, index: number) => ({
                item: item.item,
                position: index,
                addedAt: new Date().toISOString(),
                addedBy: user._id,
            })),
            itemsCount: source.itemsCount,
            totalDurationMs: source.totalDurationMs,
            status: PlaylistStatus.ACTIVE,
            visibility: PlaylistVisibility.PRIVATE,
            playlistType: source.playlistType,
            ownerType: PlaylistOwnerType.LISTENER,
            isCollaborative: false,
            collaborators: [],
            likesCount: 0,
            savesCount: 0,
            followersCount: 0,
            sharesCount: 0,
            playsCount: 0,
            isPublic: false,
            isFeatured: false,
            isPinned: false,
            tags: source.tags,
            genres: source.genres,
            languages: source.languages,
            user: user._id,
            createdBy: user._id,
        } as any;

        const created = await playlistRepository.createPlaylist(newPlaylist);
        if (created.error) {
            result.error = true;
            result.message = created.message;
            result.code = created.code;
            return result;
        }

        result.data = created.data;
        result.message = 'Playlist duplicated successfully';
        return result;
    }

    public async publishPlaylist(
        playlistId: string,
        userId: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const existing = await playlistRepository.findById(playlistId);
        if (existing.error) {
            result.error = true;
            result.message = 'Playlist not found';
            result.code = 404;
            return result;
        }

        const playlist = existing.data as IPlaylistDoc;
        if (String(playlist.user) !== userId && String(playlist.createdBy) !== userId) {
            result.error = true;
            result.message = 'Not authorized to publish this playlist';
            result.code = 403;
            return result;
        }

        if (playlist.items.length === 0) {
            result.error = true;
            result.message = 'Cannot publish an empty playlist';
            result.code = 400;
            return result;
        }

        const updated = await playlistRepository.updatePlaylist(playlistId, {
            visibility: PlaylistVisibility.PUBLIC,
            isPublic: true,
            status: PlaylistStatus.ACTIVE,
        } as Partial<IPlaylistDoc>);

        if (updated.error) {
            result.error = true;
            result.message = updated.message;
            result.code = updated.code;
            return result;
        }

        result.data = updated.data;
        result.message = 'Playlist published successfully';
        return result;
    }

    public async archivePlaylist(
        playlistId: string,
        userId: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const existing = await playlistRepository.findById(playlistId);
        if (existing.error) {
            result.error = true;
            result.message = 'Playlist not found';
            result.code = 404;
            return result;
        }

        const playlist = existing.data as IPlaylistDoc;
        if (String(playlist.user) !== userId && String(playlist.createdBy) !== userId) {
            result.error = true;
            result.message = 'Not authorized to archive this playlist';
            result.code = 403;
            return result;
        }

        const updated = await playlistRepository.updatePlaylist(playlistId, {
            status: PlaylistStatus.ARCHIVED,
            isPublic: false,
        } as Partial<IPlaylistDoc>);

        if (updated.error) {
            result.error = true;
            result.message = updated.message;
            result.code = updated.code;
            return result;
        }

        result.data = updated.data;
        result.message = 'Playlist archived successfully';
        return result;
    }

    public async getPlaylistById(playlistId: string): Promise<IResult> {
        return playlistRepository.findById(playlistId);
    }

    public async getUserPlaylists(
        userId: string,
        options: { limit?: number; skip?: number; status?: PlaylistStatus } = {},
    ): Promise<IResult> {
        const filters: any = { user: userId };
        if (options.status) {
            filters.status = options.status;
        } else {
            filters.status = { $ne: PlaylistStatus.DELETED };
        }

        const result = await playlistRepository.findAll(filters, {
            limit: options.limit || 25,
            skip: options.skip || 0,
            sort: '-updatedAt',
        });

        if (result.error && result.code === 404) {
            return {
                error: false,
                message: 'No playlists',
                code: 200,
                data: [],
            };
        }

        return result;
    }

    public async getPublicPlaylists(
        options: { limit?: number; skip?: number } = {},
    ): Promise<IResult> {
        return playlistRepository.findAll(
            {
                isPublic: true,
                status: PlaylistStatus.ACTIVE,
            },
            {
                limit: options.limit || 25,
                skip: options.skip || 0,
                sort: '-createdAt',
            },
        );
    }

    public async incrementPlayCount(playlistId: string): Promise<IResult> {
        return playlistRepository.updatePlaylist(playlistId, {
            $inc: { playsCount: 1 },
        } as any);
    }

    public async incrementShareCount(playlistId: string): Promise<IResult> {
        return playlistRepository.updatePlaylist(playlistId, {
            $inc: { sharesCount: 1 },
        } as any);
    }
}

export default new PlaylistService();
