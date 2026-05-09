import type { IAPIResponse } from '../api/_base/types';

export class TroottAPIError extends Error {
    readonly code: string;
    readonly status?: number;
    readonly details?: unknown;

    constructor(
        code: string,
        message: string,
        options?: { status?: number; details?: unknown },
    ) {
        super(message);
        this.name = 'TroottAPIError';
        this.code = code;
        this.status = options?.status;
        this.details = options?.details;
    }
}

/** Normalize backend envelopes that use `{ error, data }` or axios-shaped payloads. */
export function unwrapResponse<T>(raw: unknown): T {
    if (raw === null || raw === undefined) {
        throw new TroottAPIError('empty_response', 'Empty API response');
    }
    if (typeof raw === 'object' && raw !== null && 'data' in raw) {
        return (raw as { data: T }).data;
    }
    return raw as T;
}

export function assertOk<T>(res: IAPIResponse<T>): T {
    if (res?.error) {
        throw new TroottAPIError(
            'api_error',
            (res.message as string) || 'Request failed',
            { details: res.errors },
        );
    }
    return res.data;
}
