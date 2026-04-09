import { Types } from 'mongoose';
import { dateToday, IDateToday } from '@btffamily/pacitude';
import {
    IAdminDoc,
    AdminDepartmentEnum,
    AdminTypeEnum,
    CompanyRoleEnum,
} from './admin.interface';
import { CreateAdminDTO, UpdateAdminDTO } from './admin.dto';
import adminRepository from './admin.repository';
import { IResult } from '../../../utils/interfaces.util';
import { IUserDoc, UserType } from '../user/user.interface';
import { genSlug } from '../../../utils/helpers.util';
import { genUserCode } from '../../../utils/code.util';
import roleService from '../../authentication/role/role.service';
import PermissionService from '../../authentication/permission/permission.service';

type ObjectId = Types.ObjectId;

class AdminService {
    public result: IResult;
    public today: IDateToday;

    constructor() {
        this.today = dateToday(new Date());
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    /**
     * @method createAdmin
     * @description Creates a new admin profile in the system. Admins cannot register themselves - they must be invited.
     * @param {CreateAdminDTO} data - The admin profile payload.
     * @returns {Promise<IResult>} A structured result object.
     */
    public async createAdmin(
        data: CreateAdminDTO,
    ): Promise<IResult<{ admin: IAdminDoc; user: IUserDoc }>> {
        let result: IResult<{ admin: IAdminDoc; user: IUserDoc }> = {
            error: false,
            message: '',
            code: 200,
            data: {} as { admin: IAdminDoc; user: IUserDoc },
        };

        const {
            code,
            user,
            firstName,
            lastName,
            email,
            adminType,
            department,
            position,
            accessLevel,
            createdBy,
        } = data;

        if (!user) {
            result.error = true;
            result.code = 400;
            result.message =
                'User information is required to create an admin profile';
            return result;
        }

        if (!firstName || !lastName || !email || !adminType || !department || !position) {
            result.error = true;
            result.code = 400;
            result.message =
                'First name, last name, email, admin type, department, and position are required';
            return result;
        }

        // Check if admin profile already exists for this user
        const adminExits = await adminRepository.findAdminByUser(
            String(user._id || user.id),
        );
        if (adminExits.error === false && adminExits.data) {
            result.error = true;
            result.code = 400;
            result.message = 'Admin profile already exists for this user';
            return result;
        }

        // Ensure user has ADMIN role
        if (
            user.userType !== UserType.ADMIN &&
            user.userType !== UserType.SUPERADMIN
        ) {
            result.error = true;
            result.code = 400;
            result.message =
                'User must have ADMIN or SUPERADMIN user type to create admin profile';
            return result;
        }

        // Generate unique code and slug
        const adminCode = genUserCode(UserType.ADMIN);
        const slug = genSlug(`${firstName}-${lastName}`);
        let uniqueSlug = slug;
        let slugAttempts = 0;
        const maxSlugAttempts = 10;

        while (slugAttempts < maxSlugAttempts) {
            const existingSlugResult = await adminRepository.findOne({
                slug: uniqueSlug,
            });
            if (existingSlugResult.error || !existingSlugResult.data) {
                break;
            }
            uniqueSlug = `${slug}-${slugAttempts + 1}`;
            slugAttempts++;
        }

        // Determine access level and name based on position
        const positionToAccessLevel: Record<
            string,
            { level: number; name: string }
        > = {
            [CompanyRoleEnum.JUNIOR]: { level: 1, name: 'Junior' },
            [CompanyRoleEnum.ASSOCIATE]: { level: 2, name: 'Associate' },
            [CompanyRoleEnum.INTERMEDIATE]: { level: 3, name: 'Intermediate' },
            [CompanyRoleEnum.SENIOR]: { level: 4, name: 'Senior' },
            [CompanyRoleEnum.STAFF]: { level: 5, name: 'Staff' },
            [CompanyRoleEnum.PRINCIPAL]: { level: 6, name: 'Principal' },
            [CompanyRoleEnum.MANAGER]: { level: 7, name: 'Manager' },
            [CompanyRoleEnum.DIRECTOR]: { level: 8, name: 'Director' },
            [CompanyRoleEnum.VP]: { level: 9, name: 'VP' },
            [CompanyRoleEnum.EXECUTIVE]: { level: 10, name: 'Executive' },
        };

        const accessInfo = positionToAccessLevel[position] || {
            level: 1,
            name: 'Junior',
        };
        const finalAccessLevel = accessLevel || accessInfo.level;

        const adminData = {
            code: adminCode,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            slug: uniqueSlug,
            email: email.toLowerCase().trim(),
            adminType,
            department, // Required for all - executive board members have operational departments
            position,
            accessLevel: finalAccessLevel,
            createdBy: createdBy
                ? new Types.ObjectId(createdBy)
                : user._id || user.id,
            user: user._id || user.id,
            settings: null,
        };

        const createResult = await adminRepository.createAdmin(adminData);
        if (createResult.error || !createResult.data) {
            result.error = true;
            result.code = 500;
            result.message =
                createResult.message;
            return result;
        }

        // Ensure user has ADMIN role and permissions

        // Check if user already has ADMIN role
        const hasAdminRole = user.roles?.some(
            (r: any) =>
                (r?.name || r?.toString()) === UserType.ADMIN ||
                (r?.name || r?.toString()) === UserType.SUPERADMIN,
        );

        if (!hasAdminRole) {
            // Attach ADMIN role
            const roleAttachResult = await roleService.attachRole(
                user,
                UserType.ADMIN,
            );
            if (!roleAttachResult.error && roleAttachResult.data) {
                let updatedUser = roleAttachResult.data as IUserDoc;

                // Initialize permissions for ADMIN role
                const permResult =
                    await PermissionService.initiatePermissionData(updatedUser);
                if (!permResult.error && permResult.data) {
                    updatedUser = permResult.data as IUserDoc;
                }

                // Clear permission cache (use updatedUser or fallback to original user)
                const userId = updatedUser?._id || user._id;
                if (userId) {
                    await PermissionService.clearUserCache(String(userId));
                }
            }
        }

        result.message = 'Admin profile created successfully';
        result.code = 201;
        result.data = { admin: createResult.data as IAdminDoc, user };
        return result;
    }

    /**
     * @name getAdmin
     * @description Retrieves an admin by ID, including populated relations
     */
    public async getAdmin(adminId: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const adminResult = await adminRepository.findAdmin(adminId, [
            { path: 'user' },
            { path: 'createdBy' },
            { path: 'settings' },
        ]);

        if (adminResult.error || !adminResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Admin not found';
            return result;
        }

        result.data = adminResult.data;
        result.message = 'Admin retrieved successfully';
        return result;
    }

    /**
     * @name getAdmins
     * @description Retrieves all admins with optional filtering and pagination
     */
    public async getAdmins(
        filter?: any,
        options?: {
            select?: string;
            sort?: string;
            page?: number;
            limit?: number;
            populate?: string | any;
        },
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: [],
        };

        const adminsResult = await adminRepository.getAdmins(filter, options);

        if (adminsResult.error) {
            result.error = true;
            result.code = adminsResult.code || 500;
            result.message = adminsResult.message;
            return result;
        }

        result.data = adminsResult.data;
        result.pagination = adminsResult.pagination;
        result.pagination!.count = adminsResult.pagination?.count || 0;
        result.pagination!.total = adminsResult.pagination?.total || 0;
        result.message = 'Admins retrieved successfully';
        return result;
    }

    /**
     * @name getAdminByUser
     * @description Retrieves admin profile by user ID
     */
    public async getAdminByUser(userId: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const adminResult = await adminRepository.findAdminByUser(userId, [
            { path: 'user' },
            { path: 'createdBy' },
            { path: 'settings' },
        ]);

        if (adminResult.error || !adminResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Admin profile not found';
            return result;
        }

        result.data = adminResult.data;
        result.message = 'Admin profile retrieved successfully';
        return result;
    }

    /**
     * @name updateAdmin
     * @description Updates an admin profile with new details
     */
    public async updateAdmin(
        adminId: string,
        data: UpdateAdminDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        // Find the admin
        const findResult = await adminRepository.findAdmin(adminId);
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Admin not found';
            return result;
        }

        const updateData: Partial<IAdminDoc> = {};
        if (data.firstName !== undefined)
            updateData.firstName = data.firstName.trim();
        if (data.lastName !== undefined)
            updateData.lastName = data.lastName.trim();
        if (data.email !== undefined)
            updateData.email = data.email.toLowerCase().trim();
        if (data.adminType !== undefined) {
            updateData.adminType = data.adminType;
        }
        if (data.department !== undefined) {
            // Department can be updated for both STAFF and BOARD
            // Executive board members have departments (operational + governance)
            updateData.department = data.department;
        }
        if (data.position !== undefined) updateData.position = data.position;
        if (data.accessLevel !== undefined)
            updateData.accessLevel = data.accessLevel;

        // Update slug if name changed
        if (data.firstName || data.lastName) {
            const admin = findResult.data as IAdminDoc;
            const firstName = data.firstName || admin.firstName;
            const lastName = data.lastName || admin.lastName;
            updateData.slug = genSlug(`${firstName}-${lastName}`);
        }

        // Update the admin
        const updateResult = await adminRepository.updateAdmin(
            adminId,
            updateData,
        );
        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Admin profile updated successfully';
        result.data = updateResult.data;
        return result;
    }

    /**
     * @name deleteAdmin
     * @description Deletes an admin profile
     */
    public async deleteAdmin(adminId: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        // Find the admin
        const findResult = await adminRepository.findAdmin(adminId);
        if (findResult.error || !findResult.data) {
            result.error = true;
            result.code = 404;
            result.message = 'Admin not found';
            return result;
        }

        // Delete the admin
        const deleteResult = await adminRepository.deleteAdmin(adminId);
        if (deleteResult.error) {
            result.error = true;
            result.code = deleteResult.code;
            result.message = deleteResult.message;
            return result;
        }

        result.message = 'Admin profile deleted successfully';
        result.data = deleteResult.data;
        return result;
    }
}

export default new AdminService();
