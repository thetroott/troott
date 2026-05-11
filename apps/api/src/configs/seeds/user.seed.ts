import logger from '../../utils/logger.util';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import {
    UserType,
    PasswordType,
    OnboardStatus,
    InviteStatus,
} from '@/modules/users/user/user.interface';
import ErrorResponse from '@/utils/error.util';
import authService from '@/services/auth.service';
import { genUserCode } from '../../utils/code.util';
import { genSlug } from '@/utils/helpers.util';
import PermissionService from '@/services/permission.service';
import adminService from '@/services/admin.service';
import {
    AdminDepartmentEnum,
    AdminTypeEnum,
    CompanyRoleEnum,
} from '@/modules/users/admin/admin.interface';

/**
 * @name seedUsers
 * @description Seeds the users collection in the database using environment variables
 * @async
 * @function seedUsers
 * @returns {Promise<void>}
 * @throws {ErrorResponse} If required environment variables are missing or role doesn't exist
 */
const seedUsers = async (): Promise<void> => {
    try {
        // Get superadmin credentials from environment variables
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

        // Find superadmin role
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

        // Check if superadmin user already exists
        const existingSuperAdmin = await User.findOne({
            userType: UserType.SUPERADMIN,
        });
        if (existingSuperAdmin) {
            logger.log({
                type: 'info',
                data: `Superadmin user already exists. Skipping.`,
            });
            return;
        }
        // Create superadmin user
        let superAdmin = new User({
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
            isActivated: true,
            isActive: true,

            onboard: {
                step: 0,
                status: OnboardStatus.COMPLETED,
            },
            inviteStatus: InviteStatus.ACCEPTED,
        });

        // Encrypt password, set createdBy, and save
        await authService.encryptUserPassword(superAdmin, superAdminPassword);
        superAdmin.createdBy = superAdmin._id;
        await superAdmin.save();

        // Associate user with role
        superAdminRole.users.push(superAdmin._id);
        await superAdminRole.save();

        // Initialize permissions from the SUPERADMIN role
        // This assigns all permissions from the role to the user
        // Note: initiatePermissionData already saves the user internally
        const permResult =
            await PermissionService.initiatePermissionData(superAdmin);
        if (permResult.error) {
            logger.log({
                label: 'PERMISSION_INIT_ERROR',
                type: 'error',
                data: `Failed to initialize permissions: ${permResult.message}`,
            });
        } else {
            // Update user reference from permission result
            if (permResult.data) {
                superAdmin = permResult.data as typeof superAdmin;
            }
        }

        // Create admin profile for superadmin
        // Superadmin should have the highest access level (Executive)
        // Superadmin is STAFF (operational), not BOARD (oversight)
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

        logger.log({
            type: 'success',
            data: `Superadmin seeded successfully`,
        });
    } catch (err) {
        logger.log({
            label: 'SEEDING_ERROR',
            type: 'error',
            data: `User seeding failed: ${(err as Error).message}`,
        });
        throw err;
    }
};

export default seedUsers;
