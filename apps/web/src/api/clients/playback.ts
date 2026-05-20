import type AxiosService from '@/api/core/axios';
import type { IAPIResponse } from '@/api/types';
import type { IListQuery } from '@/utils/interfaces';
import { URL_PLAYBACK, URL_PLAYBACK_SERMON } from '../core/paths';
import type { RecordPlaybackDTO } from '@/dtos/playback.dto';

class PlaybackAPI {
    constructor(private axiosService: AxiosService) {}

    savePlaybackProgress(payload: RecordPlaybackDTO): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'POST',
            path: URL_PLAYBACK,
            isAuth: true,
            payload,
        });
    }

    listPlaybackProgress(params?: IListQuery): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_PLAYBACK,
            isAuth: true,
            params: params as Record<string, unknown> | undefined,
        });
    }

    getPlaybackForSermon(sermonId: string): Promise<IAPIResponse> {
        return this.axiosService.call({
            type: 'default',
            method: 'GET',
            path: URL_PLAYBACK_SERMON(sermonId),
            isAuth: true,
            payload: {},
        });
    }
}

export default PlaybackAPI;
