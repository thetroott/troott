import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Types } from 'mongoose';
import { UserType, PasswordType } from '../../../src/interfaces/user.interface';
import type { createUserDTO } from '../../../src/dtos/user.dto';

const mockUserDoc = (overrides: Record<string, any> = {}) => ({
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    userType: UserType.USER,
    isActive: false,
    isActivated: false,
    createdBy: null as any,
    save: jest.fn<() => Promise<any>>().mockResolvedValue(undefined),
    ...overrides,
});

const mockListenerDoc = (userId: any) => ({
    _id: new Types.ObjectId(),
    user: userId,
    Library: null,
    subscription: null,
    save: jest.fn<() => Promise<any>>().mockResolvedValue(undefined),
});

jest.mock('../../../src/repository/user.repository', () => ({
    default: {
        createUser: jest.fn<(p: any) => Promise<any>>().mockImplementation(
            (payload) =>
                Promise.resolve({
                    error: false,
                    message: '',
                    code: 201,
                    data: mockUserDoc({
                        ...payload,
                        _id: new Types.ObjectId(),
                    }),
                }),
        ),
        updateUser: jest.fn<(id: string, d: any) => Promise<any>>().mockImplementation(
            (_id, data) =>
                Promise.resolve({
                    error: false,
                    message: '',
                    code: 200,
                    data: mockUserDoc(data),
                }),
        ),
        findOne: jest.fn<(q: any) => Promise<any>>().mockResolvedValue({
            error: true,
            message: 'Not found',
            code: 404,
            data: null,
        }),
        findByEmail: jest.fn<(e: string) => Promise<any>>().mockResolvedValue({
            error: true,
            message: 'Not found',
            code: 404,
            data: null,
        }),
        findById: jest.fn<(id: string) => Promise<any>>().mockResolvedValue({
            error: true,
            message: 'Not found',
            code: 404,
            data: null,
        }),
    },
}));

jest.mock('../../../src/services/auth.service', () => ({
    default: {
        updateUserType: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        encryptUserPassword: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        attachRole: jest.fn<() => Promise<any>>().mockResolvedValue({
            error: false,
            data: null,
        }),
        activateAccount: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        updateLastLogin: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    },
}));

jest.mock('../../../src/services/role.service', () => ({
    default: {
        attachRole: jest.fn<() => Promise<any>>().mockResolvedValue({
            error: false,
            data: mockUserDoc(),
        }),
    },
}));

jest.mock('../../../src/services/permission.service', () => ({
    default: {
        initiatePermissionData: jest.fn<() => Promise<any>>().mockResolvedValue({
            error: false,
            data: mockUserDoc(),
        }),
        clearUserCache: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    },
}));

const mockCreateListener = jest.fn<() => Promise<any>>();
jest.mock('../../../src/services/core/listener.service', () => ({
    default: {
        createListener: mockCreateListener,
    },
}));

const mockCreateMinister = jest.fn<() => Promise<any>>();
jest.mock('../../../src/services/core/minister.service', () => ({
    default: {
        createMinister: mockCreateMinister,
    },
}));

const mockCreateCreator = jest.fn<() => Promise<any>>();
jest.mock('../../../src/services/core/creator.service', () => ({
    default: {
        createCreator: mockCreateCreator,
    },
}));

const mockGetOrCreateLibrary = jest.fn<() => Promise<any>>();
jest.mock('../../../src/services/core/library.service', () => ({
    default: {
        getOrCreateLibrary: mockGetOrCreateLibrary,
    },
}));

const mockSeedColdStart = jest.fn<() => Promise<any>>();
jest.mock('../../../src/services/core/recommendation.service', () => ({
    default: {
        seedColdStart: mockSeedColdStart,
    },
}));

const mockAddNewSubscription = jest.fn<() => Promise<any>>();
jest.mock('../../../src/repository/subscription.repository', () => ({
    default: {
        addNewSubscription: mockAddNewSubscription,
    },
}));

jest.mock('../../../src/models/plan.model', () => ({
    default: {
        findOne: jest.fn<() => Promise<any>>().mockResolvedValue({
            _id: new Types.ObjectId(),
            name: 'Free',
            planType: 'listener',
            isEnabled: true,
        }),
    },
}));

jest.mock('../../../src/models/user.model', () => {
    const actual = jest.requireActual('../../../src/models/user.model');
    return actual;
});

jest.mock('../../../src/services/storage.service', () => ({
    default: {
        uploadFile: jest.fn<() => Promise<any>>().mockResolvedValue({
            error: false,
            data: { fileName: 'test', s3Key: 'test' },
        }),
        deleteFile: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    },
}));

jest.mock('../../../src/services/email.service', () => ({
    default: {
        sendUserWelcomeEmail: jest.fn<() => Promise<any>>().mockResolvedValue({
            error: false,
        }),
    },
}));

jest.mock('../../../src/utils/code.util', () => ({
    genUserCode: jest.fn<() => string>().mockReturnValue('USR-TEST-001'),
}));

describe('UserService', () => {
    let userService: any;

    beforeEach(async () => {
        jest.clearAllMocks();

        const userId = new Types.ObjectId();
        const listenerId = new Types.ObjectId();
        const listenerDoc = mockListenerDoc(userId);

        mockCreateListener.mockResolvedValue({
            error: false,
            message: '',
            data: { listener: { ...listenerDoc, _id: listenerId }, user: mockUserDoc({ _id: userId }) },
        });

        mockCreateMinister.mockResolvedValue({
            error: false,
            message: '',
            data: { minister: {}, user: mockUserDoc({ _id: userId }) },
        });

        mockCreateCreator.mockResolvedValue({
            error: false,
            message: '',
            data: { creator: {}, user: mockUserDoc({ _id: userId }) },
        });

        mockGetOrCreateLibrary.mockResolvedValue({
            error: false,
            data: { _id: new Types.ObjectId() },
        });

        mockSeedColdStart.mockResolvedValue({
            error: false,
            data: {},
        });

        mockAddNewSubscription.mockResolvedValue({
            error: false,
            data: { _id: new Types.ObjectId() },
        });

        const mod = await import('../../../src/services/user.service');
        userService = mod.default;
    });

    describe('createUser', () => {
        const baseDTO: createUserDTO = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'Test@1234',
            passwordType: PasswordType.USERGENERATED,
            userType: UserType.LISTENER,
        };

        it('should reject ADMIN user type', async () => {
            await expect(
                userService.createUser({ ...baseDTO, userType: UserType.ADMIN }),
            ).rejects.toThrow('Forbidden');
        });

        it('should reject SUPERADMIN user type', async () => {
            await expect(
                userService.createUser({
                    ...baseDTO,
                    userType: UserType.SUPERADMIN,
                }),
            ).rejects.toThrow('Forbidden');
        });

        it('should create listener profile for LISTENER type', async () => {
            await userService.createUser({
                ...baseDTO,
                userType: UserType.LISTENER,
            });

            expect(mockCreateListener).toHaveBeenCalledTimes(1);
            expect(mockGetOrCreateLibrary).toHaveBeenCalledTimes(1);
            expect(mockAddNewSubscription).toHaveBeenCalledTimes(1);
            expect(mockSeedColdStart).toHaveBeenCalledTimes(1);
        });

        it('should create minister profile for MINISTER type', async () => {
            await userService.createUser({
                ...baseDTO,
                userType: UserType.MINISTER,
            });

            expect(mockCreateMinister).toHaveBeenCalledTimes(1);
            expect(mockCreateListener).not.toHaveBeenCalled();
            expect(mockGetOrCreateLibrary).not.toHaveBeenCalled();
        });

        it('should create creator profile for CREATOR type', async () => {
            await userService.createUser({
                ...baseDTO,
                userType: UserType.CREATOR,
            });

            expect(mockCreateCreator).toHaveBeenCalledTimes(1);
            expect(mockCreateListener).not.toHaveBeenCalled();
            expect(mockGetOrCreateLibrary).not.toHaveBeenCalled();
        });

        it('should create no profile for USER type', async () => {
            await userService.createUser({
                ...baseDTO,
                userType: UserType.USER,
            });

            expect(mockCreateListener).not.toHaveBeenCalled();
            expect(mockCreateMinister).not.toHaveBeenCalled();
            expect(mockCreateCreator).not.toHaveBeenCalled();
        });

        it('should propagate listener creation errors', async () => {
            mockCreateListener.mockResolvedValueOnce({
                error: true,
                message: 'Listener creation failed',
                code: 500,
                data: {},
            });

            await expect(
                userService.createUser({
                    ...baseDTO,
                    userType: UserType.LISTENER,
                }),
            ).rejects.toThrow('Listener creation failed');
        });
    });
});
