import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import {
    URL_PLAYLIST,
    URL_PLAYLIST_ADD,
    URL_PLAYLIST_BY_ID,
    URL_PLAYLIST_REMOVE,
    URL_PLAYLIST_USER,
} from '../core/paths';
import type {
    AddPlaylistItemDTO,
    CreatePlaylistDTO,
    RemovePlaylistItemDTO,
    UpdatePlaylistDTO,
} from '@/dtos/playlist.dto';

class PlaylistAPI {
    constructor(private axiosService: AxiosService) {}

    createPlaylist(payload: CreatePlaylistDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_PLAYLIST,
            isAuth: true,
            payload,
        });
    }

    getAllPlaylists(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_PLAYLIST,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getPlaylistsByUser(
        userId: string,
        params?: IListQuery,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_PLAYLIST_USER(userId),
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getPlaylistById(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_PLAYLIST_BY_ID(id),
            isAuth: true,
            payload: {},
        });
    }

    updatePlaylist(id: string, payload: UpdatePlaylistDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: URL_PLAYLIST_BY_ID(id),
            isAuth: true,
            payload,
        });
    }

    deletePlaylist(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: URL_PLAYLIST_BY_ID(id),
            isAuth: true,
            payload: {},
        });
    }

    addItem(playlistId: string, payload: AddPlaylistItemDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PATCH',
            path: URL_PLAYLIST_ADD(playlistId),
            isAuth: true,
            payload,
        });
    }

    removeItem(
        playlistId: string,
        payload: RemovePlaylistItemDTO,
    ): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PATCH',
            path: URL_PLAYLIST_REMOVE(playlistId),
            isAuth: true,
            payload,
        });
    }
}

export default PlaylistAPI;
