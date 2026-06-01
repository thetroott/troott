import type { IAPIResponse } from '@/api/types';

import {
    URL_PLAYLIST,
    URL_PLAYLIST_ADD,
    URL_PLAYLIST_BY_ID,
    URL_PLAYLIST_REMOVE,
    URL_PLAYLIST_USER,
} from '../config/path';
import type {
    AddPlaylistItemDTO,
    CreatePlaylistDTO,
    RemovePlaylistItemDTO,
    UpdatePlaylistDTO,
} from '../dtos/playlist.dto';
import { BaseService } from '../config/api-call';

export class PlaylistService extends BaseService {
    createPlaylist(payload: CreatePlaylistDTO): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_PLAYLIST,
            isAuth: true,
            payload,
        });
    }

    getAllPlaylists(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_PLAYLIST,
            isAuth: true,
            params,
        });
    }

    getPlaylistsByUser(
        userId: string,
        params?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_PLAYLIST_USER(userId),
            isAuth: true,
            params,
        });
    }

    getPlaylistById(id: string): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_PLAYLIST_BY_ID(id),
            isAuth: true,
        });
    }

    updatePlaylist(
        id: string,
        payload: UpdatePlaylistDTO,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'PUT',
            type: 'default',
            path: URL_PLAYLIST_BY_ID(id),
            isAuth: true,
            payload,
        });
    }

    deletePlaylist(id: string): Promise<IAPIResponse> {
        return this.call({
            method: 'DELETE',
            type: 'default',
            path: URL_PLAYLIST_BY_ID(id),
            isAuth: true,
        });
    }

    addItem(
        playlistId: string,
        payload: AddPlaylistItemDTO,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'PATCH',
            type: 'default',
            path: URL_PLAYLIST_ADD(playlistId),
            isAuth: true,
            payload,
        });
    }

    removeItem(
        playlistId: string,
        payload: RemovePlaylistItemDTO,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'PATCH',
            type: 'default',
            path: URL_PLAYLIST_REMOVE(playlistId),
            isAuth: true,
            payload,
        });
    }
}
