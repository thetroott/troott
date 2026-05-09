import type { TokenStorage } from '../../storage/token-storage';

export type ApiServiceType = 'default';
export type ApiMethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ChannelType = 'web' | 'mobile' | 'desktop';

export interface CallApiDTO {
    type: ApiServiceType;
    method: ApiMethodType;
    path: string;
    /** false = public route; strip bearer for this call (login/register). */
    isAuth?: boolean;
    payload?: unknown;
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    /** Skip dedupe / conditional cache for this call */
    skipDedupe?: boolean;
}

export interface IAPIResponse<T = unknown> {
    error: boolean;
    errors?: string[];
    message?: string;
    status?: number;
    data: T;
    token?: string;
    [key: string]: unknown;
}

export interface IListQuery {
    page?: number;
    limit?: number;
    skip?: number;
    sort?: string;
    select?: string;
    [key: string]: unknown;
}

export interface TroottAxiosOptions {
    channel?: ChannelType;
    locale?: string;
    tokenStorage?: TokenStorage;
    onUnauthorized?: (status: number) => void | Promise<void>;
    /** Max time per request (ms) */
    timeoutMs?: number;
    /** Enable HTTP keep-alive where supported */
    enableKeepAlive?: boolean;
    telemetrySink?: (event: {
        name: string;
        durationMs: number;
        path: string;
        status?: number;
    }) => void;
}
