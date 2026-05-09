export interface IPagination {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
}

export interface ICollection<T = unknown> {
    data: T[];
    count: number;
    total: number;
    pagination: IPagination;
    loading: boolean;
    message?: string;
}
