import type { IAPIResponse } from '@/api/types';

import { URL_PLAYBACK, URL_PLAYBACK_SERMON } from '../config/path';
import { BaseService } from '../config/api-call';

export class PlaybackService extends BaseService {
    savePlaybackProgress(
        payload: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_PLAYBACK,
            isAuth: true,
            payload,
        });
    }

    listPlaybackProgress(
        params?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_PLAYBACK,
            isAuth: true,
            params,
        });
    }

    getPlaybackForSermon(sermonId: string): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_PLAYBACK_SERMON(sermonId),
            isAuth: true,
        });
    }
}
