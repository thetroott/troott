import type { ICollection } from '@/state/helpers/interface';

/** Narrows legacy list responses where `IAPIResponse.data` is still `unknown`. */
export function listCollectionFromResponse(
    response: {
        data?: unknown;
        count?: unknown;
        total?: unknown;
        pagination?: unknown;
    },
    emptyMessage: string,
    nonEmptyLabel: string,
): ICollection {
    const data = Array.isArray(response.data) ? response.data : [];
    const count = Number(response.count ?? data.length);
    const total = Number(response.total ?? count);
    const pagination =
        response.pagination &&
        typeof response.pagination === 'object' &&
        response.pagination !== null
            ? (response.pagination as ICollection['pagination'])
            : {
                  next: { page: 1, limit: 25 },
                  prev: { page: 1, limit: 25 },
              };

    return {
        data,
        count,
        total,
        pagination,
        loading: false,
        message:
            data.length > 0
                ? `displaying ${count} ${nonEmptyLabel}`
                : emptyMessage,
    };
}

export function apiErrorMessage(response: {
    message?: unknown;
    data?: unknown;
}): string | undefined {
    if (typeof response.message === 'string' && response.message.length > 0) {
        return response.message;
    }
    if (typeof response.data === 'string') {
        return response.data;
    }
    return undefined;
}
