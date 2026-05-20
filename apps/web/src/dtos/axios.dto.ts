import type { ApiMethodType, ApiServiceType } from '../utils/types.util';

export interface CallApiDTO {
    type: ApiServiceType;
    method: ApiMethodType;
    path: string;
    isAuth?: boolean;
    payload?: unknown;
    /** Query string parameters for GET (and other methods that need `params`). */
    params?: Record<string, unknown>;
    /**
     * When true, do not auto-toast on `error: true` with HTTP 2xx (caller handles UI).
     */
    suppressErrorToast?: boolean;
}
