export interface IPagination {
    next: { page: number; limit: number };
    prev: { page: number; limit: number };
}

export interface IAPIReport {
    format: string;
    csv?: string;
    xml?: unknown;
    pdf?: unknown;
}

export interface IAPIResponse {
    error: boolean;
    errors: Array<unknown>;
    report?: IAPIReport;
    count?: number;
    total?: number;
    pagination?: IPagination;
    data: unknown;
    message: string;
    token?: string;
    status: number;
}

/**
 * Generic API envelope for typed `data` (e.g. legacy unwrap helpers).
 */
export type ApiResponse<T = unknown> = Partial<IAPIResponse> & {
    data?: T | null;
};

/** Client queue origin — used by player engine and UI. */
export enum QueuingType {
    PlayingNext = 'PLAYING_NEXT',
    DirectlyQueued = 'DIRECTLY_QUEUED',
    FromSelection = 'FROM_SELECTION',
}

export enum StreamingQuality {
    Original = 'original',
    High = 'high',
    Medium = 'medium',
    Low = 'low',
}
