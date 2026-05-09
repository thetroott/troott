import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from 'axios';
import {
    CallApiDTO,
    ChannelType,
    IAPIResponse,
    TroottAxiosOptions,
} from './types';
import { normalizeApiBaseUrl } from './env';
import { detectDefaultChannel } from './env';
import type { TokenStorage } from '../../storage/token-storage';
import { TroottAPIError } from '../../utils/helpers';

const DEFAULT_TIMEOUT_MS = 30_000;
const CIRCUIT_FAILURE_THRESHOLD = 5;
const CIRCUIT_COOLDOWN_MS = 30_000;

export default class AxiosService {
    private readonly client: AxiosInstance;
    private channel: ChannelType;
    private locale: string;
    private tokenStorage?: TokenStorage;
    private onUnauthorizedHandler?: (status: number) => void | Promise<void>;
    private readonly telemetrySink?: TroottAxiosOptions['telemetrySink'];

    private consecutive5xx = 0;
    private circuitOpenUntil = 0;
    private readonly inFlight = new Map<string, Promise<unknown>>();
    private readonly etagCache = new Map<string, { etag: string; body: unknown }>();

    constructor(baseUrl: string, options?: TroottAxiosOptions) {
        const normalized = normalizeApiBaseUrl(baseUrl);
        this.channel = options?.channel ?? detectDefaultChannel();
        this.locale = options?.locale ?? 'en';
        this.tokenStorage = options?.tokenStorage;
        this.onUnauthorizedHandler = options?.onUnauthorized;
        this.telemetrySink = options?.telemetrySink;

        this.client = axios.create({
            baseURL: normalized,
            timeout: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.client.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                config.headers = config.headers ?? {};
                config.headers.set('ch', this.channel);
                config.headers.set('lg', this.locale);

                if (config.data instanceof FormData) {
                    config.headers.delete('Content-Type');
                }

                if (config.headers.get('X-Troott-Public') === '1') {
                    config.headers.delete('Authorization');
                    config.headers.delete('X-Troott-Public');
                } else if (
                    this.tokenStorage &&
                    config.headers.get('Authorization') == null
                ) {
                    const t = await Promise.resolve(
                        this.tokenStorage.getAccessToken(),
                    );
                    if (t) {
                        config.headers.set('Authorization', `Bearer ${t}`);
                    }
                }

                const cacheKey = etagCacheKey(config);
                if (
                    config.method?.toLowerCase() === 'get' &&
                    cacheKey &&
                    !config.headers.get('If-None-Match')
                ) {
                    const hit = this.etagCache.get(cacheKey);
                    if (hit?.etag) {
                        config.headers.set('If-None-Match', hit.etag);
                    }
                }

                return config;
            },
        );

        this.client.interceptors.response.use(
            (response) => {
                if (response.status < 500) this.consecutive5xx = 0;

                const cacheKey = etagCacheKey(response.config);
                const etag = response.headers?.etag;
                if (
                    response.status === 304 &&
                    cacheKey &&
                    this.etagCache.has(cacheKey)
                ) {
                    const hit = this.etagCache.get(cacheKey)!;
                    response.data = hit.body;
                    response.status = 200;
                    return response;
                }
                if (
                    etag &&
                    cacheKey &&
                    response.status >= 200 &&
                    response.status < 300
                ) {
                    this.etagCache.set(cacheKey, {
                        etag: String(etag),
                        body: response.data,
                    });
                }
                return response;
            },
            async (error: AxiosError) => {
                const status = error.response?.status;
                if (status !== undefined && status >= 500) {
                    this.consecutive5xx++;
                    if (this.consecutive5xx >= CIRCUIT_FAILURE_THRESHOLD) {
                        this.circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
                    }
                }
                if (status === 401 || status === 403) {
                    await Promise.resolve(
                        this.onUnauthorizedHandler?.(status ?? 0),
                    );
                }
                return Promise.reject(error);
            },
        );
    }

    setChannel(channel: ChannelType): void {
        this.channel = channel;
    }

    setLocale(locale: string): void {
        this.locale = locale;
    }

    setTokenStorage(storage: TokenStorage | undefined): void {
        this.tokenStorage = storage;
    }

    setOnUnauthorized(
        fn: ((status: number) => void | Promise<void>) | undefined,
    ): void {
        this.onUnauthorizedHandler = fn;
    }

    /** Escape hatch for multipart uploads, upload progress, etc. */
    getHttpClient(): AxiosInstance {
        return this.client;
    }

    async call<T = unknown>(dto: CallApiDTO): Promise<IAPIResponse<T>> {
        if (Date.now() < this.circuitOpenUntil) {
            throw new TroottAPIError(
                'circuit_open',
                'API temporarily unavailable (circuit open)',
                { status: 503 },
            );
        }

        const dedupeKey =
            dto.method === 'GET' && dto.skipDedupe !== true
                ? `${dto.method}:${dto.path}:${JSON.stringify(dto.params ?? {})}`
                : null;

        const run = () =>
            this.executeWithRetries<T>(dto).finally(() => {
                if (dedupeKey) this.inFlight.delete(dedupeKey);
            });

        if (dedupeKey && this.inFlight.has(dedupeKey)) {
            return this.inFlight.get(dedupeKey) as Promise<IAPIResponse<T>>;
        }

        const promise = run();
        if (dedupeKey) this.inFlight.set(dedupeKey, promise);
        return promise;
    }

    private async executeWithRetries<T>(dto: CallApiDTO): Promise<IAPIResponse<T>> {
        const maxAttempts = dto.method === 'GET' ? 3 : 1;
        let attempt = 0;
        let lastError: unknown;

        const started = nowMs();

        while (attempt < maxAttempts) {
            attempt++;
            try {
                const headers: Record<string, string> = { ...(dto.headers ?? {}) };
                if (dto.isAuth === false) {
                    headers['X-Troott-Public'] = '1';
                }

                const res = await this.client.request<IAPIResponse<T>>({
                    url: dto.path,
                    method: dto.method,
                    params: dto.params,
                    data: dto.payload,
                    headers,
                    signal: dto.signal,
                });

                const path = dto.path;
                this.telemetrySink?.({
                    name: 'http_request',
                    durationMs: nowMs() - started,
                    path,
                    status: res.status,
                });

                return res.data as IAPIResponse<T>;
            } catch (err) {
                lastError = err;
                const ax = err as AxiosError;
                const status = ax.response?.status;
                const retriable =
                    dto.method === 'GET' &&
                    (status === 502 || status === 503 || status === 504) &&
                    attempt < maxAttempts;
                if (!retriable) break;
                await delay(2 ** (attempt - 1) * 100);
            }
        }

        throw normalizeAxiosError(lastError);
    }
}

function etagCacheKey(config: InternalAxiosRequestConfig): string | null {
    if (config.method?.toLowerCase() !== 'get') return null;
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
    const params = config.params ? JSON.stringify(config.params) : '';
    return `${url}?${params}`;
}

function delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

function nowMs(): number {
    if (typeof globalThis.performance?.now === 'function') {
        return globalThis.performance.now();
    }
    return Date.now();
}

function normalizeAxiosError(err: unknown): Error {
    if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as Record<string, unknown> | undefined;
        const msg =
            (typeof data?.message === 'string' && data.message) ||
            err.message ||
            'Request failed';
        return new TroottAPIError('http_error', msg, {
            status,
            details: data,
        });
    }
    return err instanceof Error ? err : new Error(String(err));
}
