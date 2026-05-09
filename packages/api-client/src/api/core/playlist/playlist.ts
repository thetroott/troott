import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';

class PlaylistAPI {
    constructor(private axiosService: AxiosService) {}

    createPlaylist(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.playlist.root,
            isAuth: true,
            payload,
        });
    }

    getAllPlaylists(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.playlist.root,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getPlaylistsByUser(userId: string, params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.playlist.user(userId),
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getPlaylistById(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.playlist.byId(id),
            isAuth: true,
        });
    }

    updatePlaylist(id: string, payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PUT',
            path: P.playlist.byId(id),
            isAuth: true,
            payload,
        });
    }

    deletePlaylist(id: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'DELETE',
            path: P.playlist.byId(id),
            isAuth: true,
        });
    }

    addItem(playlistId: string, payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PATCH',
            path: P.playlist.add(playlistId),
            isAuth: true,
            payload,
        });
    }

    removeItem(playlistId: string, payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'PATCH',
            path: P.playlist.remove(playlistId),
            isAuth: true,
            payload,
        });
    }
}

export default PlaylistAPI;
