import Axios, { AxiosInstance, type AxiosResponse } from 'axios';
import { CallApiDTO } from '../../dtos/axios.dto';
import storage from '@/api/services/local-storage';
import { toastIfApiEnvelopeError } from '@/api/core/api-envelope-toast';
import { IAPIResponse } from '../types';

function applyReissuedToken(response: AxiosResponse): void {
    const raw = response.headers['x-new-token'];
    const newToken = typeof raw === 'string' ? raw : raw?.[0];
    if (newToken?.trim()) {
        storage.setToken(newToken.trim());
    }
}

class AxiosService {
    public readonly baseUrl: string;
    private readonly http: AxiosInstance;

    constructor(baseUrl: string) {
        if (!baseUrl) {
            throw new Error('Troott API base URL is required');
        }
        this.baseUrl = baseUrl.replace(/\/?$/, '');
        this.http = Axios.create({
            baseURL: this.baseUrl,
        });
        this.http.interceptors.request.use((config) => {
            const baseHeaders = storage.getConfigWithBearer().headers;
            config.headers = config.headers ?? {};
            Object.assign(config.headers, baseHeaders);
            if (config.data instanceof FormData) {
                delete (config.headers as Record<string, unknown>)['Content-Type'];
            }
            return config;
        });
        this.http.interceptors.response.use((response) => {
            applyReissuedToken(response);
            const status = response.status;
            if (status >= 200 && status < 300 && response.data) {
                const cfg = response.config as {
                    suppressApiErrorToast?: boolean;
                };
                toastIfApiEnvelopeError(response.data, {
                    suppress: cfg.suppressApiErrorToast === true,
                });
            }
            return response;
        });
    }

    /**
     * Authenticated axios instance (same base URL and bearer wiring as uploads).
     * Use for multipart uploads and upload progress callbacks.
     */
    getHttpClient(): AxiosInstance {
        return this.http;
    }

    public async call(dto: CallApiDTO): Promise<IAPIResponse> {
        const {
            isAuth = false,
            method,
            path,
            type: _type,
            payload,
            params: query,
            suppressErrorToast = false,
        } = dto;
        void _type;

        const urlpath = `${this.baseUrl}${path}`;

        if (process.env.NODE_ENV === 'development') {
            console.log(`[API] ${method} ${urlpath}`, {
                isAuth,
                query,
                payload: payload instanceof FormData ? 'FormData' : payload,
            });
        }

        const isFormData = payload instanceof FormData;
        const baseHeaders = isAuth
            ? storage.getConfigWithBearer().headers
            : storage.getConfig().headers;

        let headers: Record<string, string>;
        if (isFormData) {
            headers = { ...baseHeaders };
            delete headers['Content-Type'];
        } else {
            headers = { ...baseHeaders };
        }

        const upper = method.toUpperCase();
        const omitBody = upper === 'GET' || upper === 'HEAD';

        let result: any = {};
        await Axios({
            method: method,
            url: urlpath,
            ...(omitBody ? {} : { data: payload }),
            ...(query ? { params: query } : {}),
            headers: headers,
        })
            .then((resp) => {
                applyReissuedToken(resp);
                result = resp.data;
                if (resp.status >= 200 && resp.status < 300) {
                    toastIfApiEnvelopeError(resp.data, {
                        suppress: suppressErrorToast,
                    });
                }
            })
            .catch((err) => {
                if (err.response) {
                    // For all error responses, use the response data if available
                    if (err.response.data) {
                        result = {
                            ...err.response.data,
                            status: err.response.status,
                            // Ensure error flag is set for non-2xx status codes
                            error:
                                err.response.status >= 400
                                    ? true
                                    : (err.response.data.error ?? false),
                        };
                    } else {
                        // Fallback if no response data
                        result = {
                            error: true,
                            status: err.response.status,
                            errors: ['an error occurred'],
                            message: `Request failed with status ${err.response.status}`,
                            data: null,
                        };
                    }
                } else if (err.request) {
                    // Request was made but no response received (network error)
                    const isConnectionRefused =
                        err.code === 'ERR_CONNECTION_REFUSED' ||
                        err.message?.includes('ERR_CONNECTION_REFUSED');
                    result = {
                        error: true,
                        status: 0,
                        errors: ['Network error'],
                        message: isConnectionRefused
                            ? `Unable to connect to the API server at ${urlpath}. Please ensure the API server is running.`
                            : 'Unable to connect to the server. Please check your internet connection.',
                        data: null,
                    };
                } else if (typeof err === 'object') {
                    result = {
                        error: true,
                        status: undefined,
                        errors: ['an error occurred. please try again'],
                        message: err.message || 'Error',
                        data: err,
                    };
                } else if (typeof err === 'string') {
                    result = {
                        error: true,
                        status: undefined,
                        errors: [err.toString()],
                        message: err.toString(),
                        data: err.toString(),
                    };
                } else {
                    result = {
                        error: true,
                        status: undefined,
                        errors: ['an unknown error occurred'],
                        message: 'An unknown error occurred',
                        data: null,
                    };
                }
            });

        return result;
    }

    public async logout(): Promise<void> {
        await this.call({
            method: 'POST',
            type: 'default',
            path: '/auth/logout',
            isAuth: true,
            payload: {},
        });
        storage.clearAuth();
    }
}

export default AxiosService;
