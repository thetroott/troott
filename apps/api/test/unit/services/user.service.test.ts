import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Types } from 'mongoose';
import { UserType, PasswordType } from '@/interfaces/user.interface';
import type { createUserDTO } from '@/dtos/user.dto';

const mockUserDoc = (overrides: Record<string, unknown> = {}) => ({
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    userType: UserType.USER,
    isActive: false,
    isActivated: false,
    createdBy: null,
    save: jest.fn<() => Promise<unknown>>().mockResolvedValue(undefined),
    markModified: jest.fn(),
    ...overrides,
});

jest.mock('@/repository/user.repository', () => ({
    __esModule: true,
    default: {
        createUser: jest.fn(),
        updateUser: jest.fn(),
        findOne: jest.fn(),
        findByEmail: jest.fn(),
        findById: jest.fn(),
    },
}));

jest.mock('@/services/auth.service', () => ({
    __esModule: true,
    default: {
        updateUserType: jest.fn(),
        encryptUserPassword: jest.fn(),
        attachRole: jest.fn(),
        activateAccount: jest.fn(),
        updateLastLogin: jest.fn(),
    },
}));

jest.mock('@/services/role.service', () => ({
    __esModule: true,
    default: {
        attachRole: jest.fn(),
    },
}));

jest.mock('@/services/permission.service', () => ({
    __esModule: true,
    default: {
        initiatePermissionData: jest.fn(),
        clearUserCache: jest.fn(),
    },
}));

jest.mock('@/services/core/listener.service', () => ({
    __esModule: true,
    default: {
        createListener: jest.fn(),
    },
}));

jest.mock('@/services/core/minister.service', () => ({
    __esModule: true,
    default: {
        createMinister: jest.fn(),
    },
}));

jest.mock('@/services/core/creator.service', () => ({
    __esModule: true,
    default: {
        createCreator: jest.fn(),
    },
}));

jest.mock('@/services/core/library.service', () => ({
    __esModule: true,
    default: {
        getOrCreateLibrary: jest.fn(),
    },
}));

jest.mock('@/services/core/recommendation.service', () => ({
    __esModule: true,
    default: {
        seedColdStart: jest.fn(),
    },
}));

jest.mock('@/repository/subscription.repository', () => ({
    __esModule: true,
    default: {
        addNewSubscription: jest.fn(),
    },
}));

jest.mock('@/repository/core/listener.repository', () => ({
    __esModule: true,
    default: {
        updateListener: jest.fn(),
    },
}));

jest.mock('@/models/plan.model', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
    },
}));

jest.mock('@/models/user.model', () =>
    jest.requireActual('@/models/user.model'),
);

jest.mock('@/services/storage.service', () => ({
    __esModule: true,
    default: {
        uploadFile: jest.fn(),
        deleteFile: jest.fn(),
    },
}));

jest.mock('@/services/email.service', () => ({
    __esModule: true,
    default: {
        sendUserWelcomeEmail: jest.fn(),
    },
}));

jest.mock('@/utils/helpers.util', () => ({
    ...jest.requireActual('@/utils/helpers.util'),
    genUserCode: jest.fn(() => 'USR-TEST-001'),
}));

import userRepository from '@/repository/user.repository';
import authService from '@/services/auth.service';
import roleService from '@/services/role.service';
import PermissionService from '@/services/permission.service';
import listenerService from '@/services/core/listener.service';
import listenerRepository from '@/repository/core/listener.repository';
import ministerService from '@/services/core/minister.service';
import creatorService from '@/services/core/creator.service';
import libraryService from '@/services/core/library.service';
import recommendationService from '@/services/core/recommendation.service';
import subscriptionRepository from '@/repository/subscription.repository';
import Plan from '@/models/plan.model';

const mockCreateUser = jest.mocked(userRepository.createUser);
const mockUpdateUser = jest.mocked(userRepository.updateUser);
const mockCreateListener = jest.mocked(listenerService.createListener);
const mockCreateMinister = jest.mocked(ministerService.createMinister);
const mockCreateCreator = jest.mocked(creatorService.createCreator);
const mockGetOrCreateLibrary = jest.mocked(libraryService.getOrCreateLibrary);
const mockSeedColdStart = jest.mocked(recommendationService.seedColdStart);
const mockAddNewSubscription = jest.mocked(
    subscriptionRepository.addNewSubscription,
);

describe('UserService', () => {
    let userService: {
        createUser: (dto: createUserDTO) => Promise<unknown>;
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const userId = new Types.ObjectId();
        const listenerId = new Types.ObjectId();

        const createdUser = mockUserDoc({
            _id: userId,
            email: 'john@example.com',
        });

        mockCreateUser.mockImplementation((payload) =>
            Promise.resolve({
                error: false,
                message: '',
                code: 201,
                data: mockUserDoc({
                    ...payload,
                    _id: userId,
                }),
            } as never),
        );

        mockUpdateUser.mockImplementation((_id, data) =>
            Promise.resolve({
                error: false,
                message: '',
                code: 200,
                data: mockUserDoc({ ...createdUser, ...data, _id: userId }),
            } as never),
        );

        jest.mocked(authService.updateUserType).mockResolvedValue(undefined);
        jest.mocked(authService.encryptUserPassword).mockResolvedValue(undefined);
        jest.mocked(roleService.attachRole).mockResolvedValue({
            error: false,
            data: createdUser,
        } as never);
        jest
            .mocked(PermissionService.initiatePermissionData)
            .mockResolvedValue({
                error: false,
                data: createdUser,
            } as never);
        jest.mocked(listenerRepository.updateListener).mockResolvedValue({
            error: false,
            data: {},
        } as never);

        mockCreateListener.mockResolvedValue({
            error: false,
            message: '',
            data: {
                listener: {
                    _id: listenerId,
                    user: userId,
                    save: jest.fn(),
                },
                user: mockUserDoc({ _id: userId }),
            },
        } as never);

        mockCreateMinister.mockResolvedValue({
            error: false,
            message: '',
            data: { minister: {}, user: mockUserDoc({ _id: userId }) },
        } as never);

        mockCreateCreator.mockResolvedValue({
            error: false,
            message: '',
            data: { creator: {}, user: mockUserDoc({ _id: userId }) },
        } as never);

        mockGetOrCreateLibrary.mockResolvedValue({
            error: false,
            data: { _id: new Types.ObjectId() },
        } as never);

        mockSeedColdStart.mockResolvedValue({
            error: false,
            data: {},
        } as never);

        mockAddNewSubscription.mockResolvedValue({
            error: false,
            data: { _id: new Types.ObjectId() },
        } as never);

        jest.mocked(Plan.findOne).mockResolvedValue({
            _id: new Types.ObjectId(),
            code: 'plan-free-listener',
            name: 'Free',
            planType: 'listener',
            isEnabled: true,
        } as never);

        const mod = await import('@/services/user.service');
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
            } as never);

            await expect(
                userService.createUser({
                    ...baseDTO,
                    userType: UserType.LISTENER,
                }),
            ).rejects.toThrow('Listener creation failed');
        });
    });
});
