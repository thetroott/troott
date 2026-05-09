import type AxiosService from '../../_base/axios';
import type { IAPIResponse, IListQuery } from '../../_base/types';
import { P } from '../../_base/paths';

class PlaybackAPI {
    constructor(private axiosService: AxiosService) {}

    savePlaybackProgress(payload: unknown): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: P.playback.root,
            isAuth: true,
            payload,
        });
    }

    listPlaybackProgress(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.playback.root,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getPlaybackForSermon(sermonId: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: P.playback.sermon(sermonId),
            isAuth: true,
        });
    }
}

export default PlaybackAPI;
