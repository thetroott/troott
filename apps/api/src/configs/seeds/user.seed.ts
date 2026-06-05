import logger from '../../utils/logger.util';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import {
    UserType,
    PasswordType,
    OnboardStatus,
    InviteStatus,
} from '@/interfaces/user.interface';
import type { IListenerDoc } from '@/interfaces/core/listener.interface';
import ErrorResponse from '@/utils/error.util';
import authService from '@/services/auth.service';
import { genUserCode } from '@/utils/helpers.util';
import { genSlug } from '@/utils/helpers.util';
import PermissionService from '@/services/permission.service';
import adminService from '@/services/admin.service';
import ministerService from '@/services/core/minister.service';
import listenerService from '@/services/core/listener.service';
import libraryService from '@/services/core/library.service';
import recommendationService from '@/services/core/recommendation.service';
import userService from '@/services/user.service';
import userRepository from '@/repository/user.repository';
import ministerRepository from '@/repository/core/minister.repository';
import listenerRepository from '@/repository/core/listener.repository';
import {
    AdminDepartmentEnum,
    AdminTypeEnum,
    CompanyRoleEnum,
} from '@/interfaces/admin.interface';

const seedUsers = async (): Promise<void> => {
    const superAdminEmail = process.env.SUPERADMIN_EMAIL;
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD;
    const superAdminFirstName = process.env.SUPERADMIN_FIRSTNAME;
    const superAdminLastName = process.env.SUPERADMIN_LASTNAME;

    if (
        !superAdminEmail ||
        !superAdminPassword ||
        !superAdminFirstName ||
        !superAdminLastName
    ) {
        throw new ErrorResponse(
            'SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_FIRSTNAME, and SUPERADMIN_LASTNAME environment variables are required for seeding',
            400,
            [],
        );
    }

    const superAdminRole = await Role.findOne({
        name: UserType.SUPERADMIN,
    });
    if (!superAdminRole) {
        throw new ErrorResponse(
            `Role "${UserType.SUPERADMIN}" does not exist. Run role seeding first.`,
            400,
            [],
        );
    }

    let superAdmin = await User.findOne({
        userType: UserType.SUPERADMIN,
    });

    if (!superAdmin) {
        superAdmin = new User({
            code: genUserCode(UserType.SUPERADMIN),
            email: superAdminEmail.toLowerCase(),
            firstName: superAdminFirstName,
            lastName: superAdminLastName,
            slug: genSlug(`${superAdminFirstName}-${superAdminLastName}`),
            roles: [superAdminRole._id],
            userType: UserType.SUPERADMIN,
            passwordType: PasswordType.USERGENERATED,
            isSuper: true,
            isUser: true,
            isAdmin: true,
            isMinister: true,
            isListener: true,
            isActivated: true,
            isActive: true,
            onboard: {
                step: 0,
                status: OnboardStatus.COMPLETED,
            },
            inviteStatus: InviteStatus.ACCEPTED,
        });

        await authService.encryptUserPassword(superAdmin, superAdminPassword);
        superAdmin.createdBy = superAdmin._id;
        await superAdmin.save();

        superAdminRole.users.push(superAdmin._id);
        await superAdminRole.save();

        const permResult =
            await PermissionService.initiatePermissionData(superAdmin);
        if (permResult.error) {
            logger.log({
                label: 'PERMISSION_INIT_ERROR',
                type: 'error',
                data: `Failed to initialize permissions: ${permResult.message}`,
            });
        } else if (permResult.data) {
            superAdmin = permResult.data as typeof superAdmin;
        }

        const adminProfileResult = await adminService.createAdmin({
            code: superAdmin.code,
            user: superAdmin,
            firstName: superAdminFirstName,
            lastName: superAdminLastName,
            email: superAdminEmail.toLowerCase(),
            adminType: AdminTypeEnum.BOARD,
            department: AdminDepartmentEnum.PRODUCT_ENGINEERING,
            position: CompanyRoleEnum.EXECUTIVE,
            accessLevel: 10,
        });

        if (adminProfileResult.error) {
            logger.log({
                label: 'ADMIN_PROFILE_CREATE_ERROR',
                type: 'error',
                data: `Failed to create admin profile: ${adminProfileResult.message}`,
            });
        } else {
            logger.log({
                type: 'success',
                data: `Superadmin admin profile created successfully.`,
            });
        }
    } else {
        logger.log({
            type: 'info',
            data: `Superadmin user already exists.`,
        });
    }

    const userId = String(superAdmin._id);

    await userRepository.updateUser(userId, {
        isSuper: true,
        isAdmin: true,
        isUser: true,
        isMinister: true,
        isCreator: false,
        isListener: true,
        isActivated: true,
        isActive: true,
        userType: UserType.SUPERADMIN,
        'onboard.step': 6,
        'onboard.status': OnboardStatus.COMPLETED,
    } as never);

    superAdmin = await User.findById(userId);
    if (!superAdmin) {
        throw new Error('Superadmin user not found');
    }

    if (!superAdmin.minister) {
        const ministerResult = await ministerService.createMinister({
            user: superAdmin,
            userType: UserType.MINISTER,
            email: superAdmin.email,
            createdBy: superAdmin._id,
        });
        if (ministerResult.error) {
            throw new Error(
                ministerResult.message ||
                    'Failed to create minister profile for superadmin',
            );
        }
        superAdmin = await User.findById(userId);
        if (!superAdmin) {
            throw new Error('Superadmin user not found after minister create');
        }
    }

    const listenerLookup = await listenerRepository.findOne({
        user: userId,
    });
    let listener = listenerLookup.error
        ? undefined
        : (listenerLookup.data as IListenerDoc);

    if (!listener) {
        const listenerResult = await listenerService.createListener({
            user: superAdmin,
            userType: UserType.LISTENER,
            email: superAdmin.email,
            createdBy: userId,
        });
        if (listenerResult.error || !listenerResult.data?.listener) {
            throw new Error(
                listenerResult.message ||
                    'Failed to create listener profile for superadmin',
            );
        }
        listener = listenerResult.data.listener as IListenerDoc;
    }

    const listenerId = String(listener._id);

    const libResult = await libraryService.getOrCreateLibrary(listenerId);
    if (!libResult.error && libResult.data) {
        const libraryId =
            (libResult.data as { _id?: unknown })._id || libResult.data;
        await listenerRepository.updateListener(listenerId, {
            Library: libraryId,
        } as never);
        listener = { ...listener, Library: libraryId } as IListenerDoc;
    }

    await userService.assignFreeSubscriptionForListener(listenerId, listener);

    try {
        await recommendationService.seedColdStart(
            listenerId,
            superAdmin.location?.country || '',
        );
    } catch {
        // non-critical
    }

    await userRepository.updateUser(userId, {
        listener: listener._id,
        isListener: true,
    } as never);

    const ministerDoc = await ministerRepository.findOne({ user: userId });
    if (!ministerDoc.error && ministerDoc.data) {
        const ministerId = String((ministerDoc.data as { _id: unknown })._id);
        await ministerRepository.updateMinister(ministerId, {
            $set: {
                'onboarding.step': 6,
                'onboarding.status': OnboardStatus.COMPLETED,
            },
        } as never);
    }

    await userRepository.updateUser(userId, {
        'onboard.step': 6,
        'onboard.status': OnboardStatus.COMPLETED,
    } as never);

    const ministerForStudio = await ministerRepository.findOne({
        user: userId,
    });
    if (!ministerForStudio.error && ministerForStudio.data) {
        const ministerStudio = (ministerForStudio.data as { studio?: unknown })
            .studio;
        if (ministerStudio != null) {
            await userRepository.updateUser(userId, {
                primaryStudio: ministerStudio,
            } as never);
        }
    }

    logger.log({
        type: 'success',
        data: `Superadmin seeded successfully`,
    });
};

export default seedUsers;
