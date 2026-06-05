import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Types } from 'mongoose';
import { UserType } from '../../../src/interfaces/user.interface';

const ministerFindById = jest.fn<() => Promise<{ error: boolean; data?: unknown }>>();
const listenerFindById = jest.fn<() => Promise<{ error: boolean; data?: unknown }>>();
const listenerFindOne = jest.fn<() => Promise<{ error: boolean; data?: unknown }>>();
const creatorFindOne = jest.fn<() => Promise<{ error: boolean; data?: unknown }>>();
const adminFindByUser = jest.fn<() => Promise<{ error: boolean; data?: unknown }>>();
const studioFindById = jest.fn<() => Promise<{ error: boolean; data?: unknown }>>();

jest.mock('../../../src/repository/core/minister.repository', () => ({
    __esModule: true,
    default: { findById: (...args: unknown[]) => ministerFindById(...args) },
}));
jest.mock('../../../src/repository/core/listener.repository', () => ({
    __esModule: true,
    default: {
        findById: (...args: unknown[]) => listenerFindById(...args),
        findOne: (...args: unknown[]) => listenerFindOne(...args),
    },
}));
jest.mock('../../../src/repository/core/creator.repository', () => ({
    __esModule: true,
    default: { findOne: (...args: unknown[]) => creatorFindOne(...args) },
}));
jest.mock('../../../src/repository/admin.repository', () => ({
    __esModule: true,
    default: {
        findAdminByUser: (...args: unknown[]) => adminFindByUser(...args),
    },
}));
jest.mock('../../../src/repository/core/studio.repository', () => ({
    __esModule: true,
    default: {
        findStudioById: (...args: unknown[]) => studioFindById(...args),
    },
}));

import authMapper from '../../../src/mappers/auth.mapper';

describe('auth.mapper — superadmin persona flags (feat-0017)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        ministerFindById.mockResolvedValue({
            error: false,
            data: { code: 'min-001' },
        });
        listenerFindById.mockResolvedValue({
            error: false,
            data: { code: 'lis-001' },
        });
        listenerFindOne.mockResolvedValue({ error: true, data: undefined });
        creatorFindOne.mockResolvedValue({
            error: false,
            data: { code: 'cre-001' },
        });
        adminFindByUser.mockResolvedValue({
            error: false,
            data: { code: 'adm-001' },
        });
        studioFindById.mockResolvedValue({
            error: false,
            data: { code: 'stu-minister' },
        });
    });

    it('maps persona flags from User booleans when userType is super-admin', async () => {
        const userId = new Types.ObjectId();
        const ministerId = new Types.ObjectId();
        const listenerId = new Types.ObjectId();
        const studioId = new Types.ObjectId();

        const mapped = await authMapper.mapRegisteredUser({
            _id: userId,
            id: String(userId),
            code: 'usr-super',
            slug: 'super-admin',
            firstName: 'Super',
            lastName: 'Admin',
            email: 'super@test.com',
            userType: UserType.SUPERADMIN,
            isSuper: true,
            isAdmin: true,
            isUser: true,
            isMinister: true,
            isCreator: true,
            isListener: true,
            isActive: true,
            isLocked: false,
            isActivated: true,
            isDeactivated: false,
            isSuspended: false,
            minister: ministerId,
            listener: listenerId,
            primaryStudio: studioId,
            roles: [{ name: UserType.SUPERADMIN }],
            onboard: { step: 6, status: 'completed', stage: '' },
        } as never);

        expect(mapped.isMinister).toBe(true);
        expect(mapped.isCreator).toBe(true);
        expect(mapped.isListener).toBe(true);
        expect(mapped.creatorCode).toBe('cre-001');
        expect(mapped.ministerCode).toBe('min-001');
        expect(mapped.listenerCode).toBe('lis-001');
        expect(mapped.studioCode).toBe('stu-minister');
        expect(mapped.adminCode).toBe('adm-001');
    });

    it('resolves listenerCode via user lookup when user.listener ref is missing', async () => {
        const userId = new Types.ObjectId();
        listenerFindOne.mockResolvedValue({
            error: false,
            data: { _id: new Types.ObjectId(), code: 'lis-fallback' },
        });
        listenerFindById.mockResolvedValue({
            error: false,
            data: { code: 'lis-fallback' },
        });

        const mapped = await authMapper.mapRegisteredUser({
            _id: userId,
            id: String(userId),
            code: 'usr-super',
            slug: 'super-admin',
            firstName: 'Super',
            lastName: 'Admin',
            email: 'super@test.com',
            userType: UserType.SUPERADMIN,
            isSuper: true,
            isAdmin: true,
            isUser: true,
            isMinister: true,
            isCreator: true,
            isListener: true,
            isActive: true,
            isLocked: false,
            isActivated: true,
            isDeactivated: false,
            isSuspended: false,
            roles: [],
            onboard: { step: 6, status: 'completed', stage: '' },
        } as never);

        expect(listenerFindOne).toHaveBeenCalled();
        expect(mapped.listenerCode).toBe('lis-fallback');
    });
});
