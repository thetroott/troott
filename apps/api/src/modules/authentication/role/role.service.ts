import { Types } from 'mongoose';
import { dateToday, IDateToday } from '@btffamily/pacitude';
import { IRoleDoc } from './role.interface';
import roleRepository from './role.repository';
import { IResult } from '../../../utils/interfaces.util';
import User from '../../users/user/user.model';
import { IUserDoc, UserType } from '../../users/user/user.interface';
import permissionService from '../permission/permission.service';


class RoleService {
    public result: IResult;
    public today: IDateToday;

    constructor() {
        this.today = dateToday(new Date());
        this.result = { error: false, message: '', code: 200, data: {} };
    }
    
    /**
     * @name attachRole
     * @description Attach a role to a user (supports multiple roles and hierarchical roles)
     * @param user - User document
     * @param roleName - Role name to attach
     * @returns Promise<IResult>
     */
    public async attachRole(user: IUserDoc, roleName: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const roleResult = await roleRepository.findByName(roleName);
        if (roleResult.error || !roleResult.data) {
            result.error = true;
            result.code = 404;
            result.message = `Role ${roleName} does not exist`;
            return result;
        }

        const role = roleResult.data as IRoleDoc;

        // Check if trying to attach superadmin role
        if (roleName === UserType.SUPERADMIN || role.name === UserType.SUPERADMIN) {
            // Check if another user already has superadmin role
            const existingSuperAdmin = await User.findOne({
                roles: role._id,
                _id: { $ne: user._id },
            }).populate('roles');

            if (existingSuperAdmin) {
                result.error = true;
                result.code = 400;
                result.message = 'forbidden';
                return result;
            }
        }

        try {
            // Ensure roles array exists
            if (!user.roles) {
                user.roles = [];
            }

            // Add role if not already present
            const roleId = role._id.toString();
            const existingRoleIndex = user.roles.findIndex(
                (r: any) => r?.toString() === roleId || r?._id?.toString() === roleId
            );

            if (existingRoleIndex === -1) {
                user.roles.push(role._id);
                await user.save();

                // Update role's users array
                const userId = user._id.toString();
                if (!role.users.some((u: any) => u?.toString() === userId || u?._id?.toString() === userId)) {
                    role.users = [...role.users, user._id];
                    await role.save();
                }

                // Clear user permission cache
                await permissionService.clearUserCache(String(user._id));

                result.message = `Role ${roleName} attached successfully`;
                result.data = user;
            } else {
                result.message = `User already has role ${roleName}`;
                result.data = user;
            }

            return result;
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
            return result;
        }
    }

    /**
     * @name detachRole
     * @description Remove a role from a user
     * @param user - User document
     * @param roleName - Role name to detach
     * @returns Promise<IResult>
     */
    public async detachRole(user: IUserDoc, roleName: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const roleResult = await roleRepository.findByName(roleName);
        if (roleResult.error || !roleResult.data) {
            result.error = true;
            result.code = 404;
            result.message = `Role ${roleName} does not exist`;
            return result;
        }

        const role = roleResult.data as IRoleDoc;

        // Check if trying to detach superadmin role
        if (roleName === UserType.SUPERADMIN || role.name === UserType.SUPERADMIN) {
            // Check if this is the only user with superadmin role
            const superAdminCount = await User.countDocuments({
                roles: role._id,
            });

            if (superAdminCount <= 1) {
                result.error = true;
                result.code = 400;
                result.message = 'Cannot detach superadmin role. System must have at least one superadmin.';
                return result;
            }
        }

        try {
            if (!user.roles || user.roles.length === 0) {
                result.message = `User does not have role ${roleName}`;
                result.data = user;
                return result;
            }

            // Remove role from user's roles array
            const roleId = role._id.toString();
            const initialLength = user.roles.length;
            user.roles = user.roles.filter(
                (r: any) => r?.toString() !== roleId && r?._id?.toString() !== roleId
            );

            if (user.roles.length < initialLength) {
                await user.save();

                // Remove user from role's users array
                const userId = user._id.toString();
                role.users = role.users.filter(
                    (u: any) => u?.toString() !== userId && u?._id?.toString() !== userId
                );
                await role.save();

                // Clear user permission cache
                await permissionService.clearUserCache(String(user._id));

                result.message = `Role ${roleName} detached successfully`;
                result.data = user;
            } else {
                result.message = `User does not have role ${roleName}`;
                result.data = user;
            }

            return result;
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
            return result;
        }
    }

    /**
     * @name getUserRoles
     * @description Get all roles for a user
     * @param userId - User ID
     * @returns Promise<IResult>
     */
    public async getUserRoles(userId: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const user = await User.findById(userId).populate('roles');
            if (!user) {
                result.error = true;
                result.code = 404;
                result.message = 'User not found';
                return result;
            }

            result.data = (user as any).roles || [];
            result.message = 'User roles retrieved successfully';
            return result;
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message;
            return result;
        }
    }
}

export default new RoleService();
