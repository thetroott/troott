import { describe, it, expect } from '@jest/globals';
import type { Request } from 'express';
import { getAuthUserId } from '@/utils/auth-request.util';

function makeReq(user: unknown): Request {
    return { user } as Request;
}

describe('getAuthUserId', () => {
    it('returns empty string when user is missing', () => {
        expect(getAuthUserId(makeReq(undefined))).toBe('');
    });

    it('returns id when present on user', () => {
        expect(getAuthUserId(makeReq({ id: '507f1f77bcf86cd799439011' }))).toBe(
            '507f1f77bcf86cd799439011',
        );
    });

    it('stringifies non-string id', () => {
        expect(getAuthUserId(makeReq({ id: 42 as unknown as string }))).toBe(
            '42',
        );
    });
});
