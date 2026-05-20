/**
 * Base service: unified `call()` entry to {@link httpClient}.
 * All service HTTP methods resolve to {@link IAPIResponse}.
 */

import type { CallApiDTO } from '../dtos/axios.dto';
import { httpClient, RequestConfig, type TroottHttpClient } from '../http-client';
import type { ApiResponse, IAPIResponse } from '@/utils/interface.utl';


function appendQueryParams(
    path: string,
    params?: Record<string, unknown>,
): string {
    if (!params || Object.keys(params).length === 0) {
        return path;
    }
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (Array.isArray(value)) {
            for (const item of value) {
                search.append(key, String(item));
            }
        } else {
            search.append(key, String(value));
        }
    }
    const qs = search.toString();
    return qs ? `${path}${path.includes('?') ? '&' : '?'}${qs}` : path;
}

export abstract class BaseService {
    constructor(protected readonly http: TroottHttpClient = httpClient) {}

    /**
     * Single HTTP entry point for domain services.
     * Normalizes JSON bodies into a consistent {@link IAPIResponse} shape.
     */
    protected async call(params: CallApiDTO): Promise<IAPIResponse> {
        const responseType = params.type ?? 'default';
        if (responseType !== 'default') {
            // Future: branch on envelope / parser type.
        }

        const skipAuth = !(params.isAuth ?? false);
        const mutating =
            params.method !== 'GET' && params.method !== 'DELETE';

        let body: BodyInit | undefined;
        let extraHeaders: Record<string, string> | undefined;

        if (mutating) {
            if (params.payload instanceof FormData) {
                body = params.payload;
                extraHeaders = undefined;
            } else {
                body = JSON.stringify(params.payload ?? {});
                extraHeaders = { 'Content-Type': 'application/json' };
            }
        }

        const requestInit: RequestConfig = {
            method: params.method,
            skipAuth,
            body,
            headers: extraHeaders,
            signal: params.signal,
        };

        const pathWithQuery = appendQueryParams(params.path, params.params);

        const raw = await this.http.request<IAPIResponse>(
            pathWithQuery,
            requestInit,
        );
        return this.normalizeIAPIResponse(raw);
    }

    private normalizeIAPIResponse(raw: unknown): IAPIResponse {
        if (!raw || typeof raw !== 'object') {
            return {
                error: true,
                errors: ['Invalid response'],
                data: null,
                message: 'Invalid response',
                status: 0,
            };
        }
        const r = raw as Partial<IAPIResponse> & Record<string, unknown>;
        return {
            error: Boolean(r.error),
            errors: Array.isArray(r.errors) ? (r.errors as any[]) : [],
            report: r.report as IAPIResponse['report'],
            count: r.count,
            total: r.total,
            pagination: r.pagination,
            data: r.data ?? null,
            message: typeof r.message === 'string' ? r.message : '',
            token: r.token,
            status: typeof r.status === 'number' ? r.status : 200,
        };
    }

    /** Legacy helper for older `ApiResponse<T>` payloads (non-IAPIResponse). */
    protected extractData<T>(response: ApiResponse<T> | T): T {
        if (response && typeof response === 'object' && 'data' in response) {
            const apiResponse = response as ApiResponse<T>;
            return (apiResponse.data ?? response) as T;
        }
        return response as T;
    }
}
