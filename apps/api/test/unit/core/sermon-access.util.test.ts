import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { Request } from 'express';
import { canAccessSermonDocument } from '@/modules/core/sermon/sermon-access.util';
import Minister from '@/models/minister.model';

jest.mock('@/models/minister.model', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
    },
}));

describe('canAccessSermonDocument', () => {
    const mockReq = (userId?: string) =>
        ({
            user: userId ? { id: userId } : undefined,
        }) as unknown as Request;

    const publicDoc = {
        isPublic: true,
        status: 'published',
        state: 'active',
        minister: '605c4f8e8f8f8f8f8f8f8f8f',
    };

    beforeEach(() => {
        (Minister.findOne as jest.Mock).mockReset();
    });

    it('allows public published sermon without auth', async () => {
        const ok = await canAccessSermonDocument(mockReq(), publicDoc);
        expect(ok).toBe(true);
        expect(Minister.findOne).not.toHaveBeenCalled();
    });

    it('denies private sermon without auth', async () => {
        const ok = await canAccessSermonDocument(mockReq(), {
            ...publicDoc,
            isPublic: false,
        });
        expect(ok).toBe(false);
    });

    it('allows minister owner for non-public draft', async () => {
        (Minister.findOne as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: 'm' }),
            }),
        });
        const uid = '507f1f77bcf86cd799439011';
        const ok = await canAccessSermonDocument(mockReq(uid), {
            isPublic: false,
            status: 'draft',
            state: 'active',
            minister: '605c4f8e8f8f8f8f8f8f8f8f',
        });
        expect(ok).toBe(true);
        expect(Minister.findOne).toHaveBeenCalled();
    });
});
