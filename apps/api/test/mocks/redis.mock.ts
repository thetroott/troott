/**
 * Mock for Redis service
 * Prevents actual Redis connections during tests
 */

import { jest } from '@jest/globals';
import { IData } from '../../src/utils/interfaces.util';

const redisMock = {
    client: null,
    connect: jest
        .fn<(options: any) => Promise<void>>()
        .mockResolvedValue(undefined),
    disconnect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    keepData: jest
        .fn<(data: IData, exp: number) => Promise<string>>()
        .mockResolvedValue('OK'),
    fetchData: jest
        .fn<<T = any>(key: string) => Promise<T | null>>()
        .mockResolvedValue(null),
    deleteData: jest
        .fn<(key: string) => Promise<void>>()
        .mockResolvedValue(undefined),
    exists: jest
        .fn<(key: string) => Promise<boolean>>()
        .mockResolvedValue(false),
    paginate: jest
        .fn<(data: any[], page?: number, limit?: number) => any[]>()
        .mockImplementation((data: any[], page = 1, limit = 10) => {
            const start = (page - 1) * limit;
            const end = start + limit;
            return data.slice(start, end);
        }),
};

export default redisMock;
