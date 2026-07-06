/**
 * Logical upstream or parsing variant for a request.
 * Only `default` is implemented; other values are reserved for future routing.
 */
export type ApiServiceType =
    | 'default'
    | 'backend'
    | 'identity'
    | 'core'
    | 'genius'
    | 'resource';

/** Supported HTTP verbs for {@link CallApiDTO}. */
export type ApiMethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Single-call contract passed from feature services into the shared HTTP layer.
 * Mirrors the Troott `AxiosService.call` shape (method, path, auth flag, body).
 */
export interface CallApiDTO {
    /** Parser / service variant; use `default` unless a split stack is introduced. */
    type: ApiServiceType;
    /** HTTP method for the request. */
    method: ApiMethodType;
    /** Absolute or root-relative URL path (same string passed to `fetch`). */
    path: string;
    /**
     * When true, attach the Bearer token from secure session storage.
     * When false or omitted, send without Authorization (public routes).
     */
    isAuth?: boolean;
    /** JSON-serializable body for mutating methods; omitted for GET/DELETE unless needed. */
    payload?: unknown;
    /** Optional abort signal for cancellation / timeouts. */
    signal?: AbortSignal;
    /** Query string parameters for GET (and other methods when needed). */
    params?: Record<string, unknown>;
}
