import type { IAPIResponse } from '@/api/types';

import {
    URL_SERMON_MINISTER_MOST_LIKED,
    URL_SERMON_MINISTER_MOST_PLAYED,
    URL_SERMON_MINISTER_RECENTLY_PUBLISHED,
    URL_SERMON,
    URL_SERMON_BY_ID,
    URL_SERMON_MINISTER,
    URL_SERMON_STATS_MOST_LIKED,
    URL_SERMON_STATS_MOST_PLAYED,
    URL_SERMON_STATS_MOST_SHARED,
    URL_SERMON_STATS_RECENTLY_PUBLISHED,
    URL_SERMON_TOPIC,
    URL_SERMON_USER_FAVORITE_MINISTERS,
    URL_SERMON_USER_INTERESTS,
    URL_SERMON_USER_POPULAR,
    URL_SERMON_USER_RECENTLY_ADDED,
    URL_SERMON_USER_RECENTLY_PLAYED,
} from '../config/path';
import { BaseService } from '../config/api-call';

export class SermonService extends BaseService {
    getAllSermons(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON,
            isAuth: false,
            params,
        });
    }

    getSermonById(id: string): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_BY_ID(id),
            isAuth: true,
        });
    }

    getSermonsByTopic(
        topic: string,
        params?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_TOPIC(topic),
            isAuth: false,
            params,
        });
    }

    getSermonsByMinister(
        ministerId: string,
        params?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_MINISTER(ministerId),
            isAuth: false,
            params,
        });
    }

    getUserRecentlyPlayed(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_USER_RECENTLY_PLAYED,
            isAuth: true,
            params,
        });
    }

    getUserRecentlyAdded(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_USER_RECENTLY_ADDED,
            isAuth: true,
            params,
        });
    }

    getUserPopular(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_USER_POPULAR,
            isAuth: true,
            params,
        });
    }

    getUserInterests(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_USER_INTERESTS,
            isAuth: true,
            params,
        });
    }

    getFavoriteMinistersSermons(
        params?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_USER_FAVORITE_MINISTERS,
            isAuth: true,
            params,
        });
    }

    getStatsMostPlayed(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_STATS_MOST_PLAYED,
            isAuth: false,
            params,
        });
    }

    getStatsMostLiked(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_STATS_MOST_LIKED,
            isAuth: false,
            params,
        });
    }

    getStatsMostShared(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_STATS_MOST_SHARED,
            isAuth: false,
            params,
        });
    }

    getStatsRecentlyPublished(
        params?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_STATS_RECENTLY_PUBLISHED,
            isAuth: false,
            params,
        });
    }

    getMinisterMostPlayed(
        ministerId: string,
        params?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_MINISTER_MOST_PLAYED(ministerId),
            isAuth: false,
            params,
        });
    }

    getMinisterMostLiked(
        ministerId: string,
        params?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_MINISTER_MOST_LIKED(ministerId),
            isAuth: false,
            params,
        });
    }

    getMinisterRecentlyPublished(
        ministerId: string,
        params?: Record<string, unknown>,
    ): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SERMON_MINISTER_RECENTLY_PUBLISHED(ministerId),
            isAuth: false,
            params,
        });
    }
}
