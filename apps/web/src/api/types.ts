import { IAPIReport, IPagination } from '@/utils/interfaces';

export interface IAPIResponse {
    error: boolean;
    errors: Array<any>;
    report?: IAPIReport;
    count?: number;
    total?: number;
    pagination?: IPagination;
    data: any;
    message: string;
    token?: string;
    status: number;
}
