import fs from 'fs';
import path from 'path';
import Permission from '@/modules/authentication/permission/permission.model';
import Role from '@/modules/authentication/role/role.model';
import User from '@/modules/users/user/user.model';
import { UserType } from '@/modules/users/user/user.interface';
import PermissionService from '@/modules/authentication/permission/permission.service';
import logger from '@/utils/logger.util';

/**
 * @name permissionsData
 * @description Reads and parses the permissions data from JSON file
 * @type {Object} permissionsData - Contains array of permission objects
 */
const permissionsData = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, '../../_data/permissions.json'),
        'utf-8',
    ),
);

/**
 * @name seedPermissions
 * @description Seeds the permissions collection in the database
 * @returns {Promise<void>}
 * @throws {Error} If there's an error reading the file or inserting data
 */
const seedPermissions = async (): Promise<void> => {
    try {
        const upserted: Array<any> = [];

        for (const perm of permissionsData) {
            const doc = await Permission.findOneAndUpdate(
                { action: perm.action },
                { $set: { description: perm.description } },
                { upsert: true, new: true, setDefaultsOnInsert: true },
            );
            if (doc) upserted.push(doc);
        }

        logger.log({
            data: `${upserted.length} permissions upserted successfully`,
            type: 'info',
        });

        // Import rolePermissionMap from permission.util
        const { rolePermissionMap } = await import(
            '@/modules/authentication/permission/permission.util'
        );

        // If a rolePermissionMap is available, map role names to actions
        if (rolePermissionMap && typeof rolePermissionMap === 'object') {
            const allPermissions = await Permission.find({});
            const permissionsMap = new Map<string, any>();
            for (const p of allPermissions) {
                permissionsMap.set(String(p.action), p._id);
            }
            const roles = await Role.find({});

            for (const role of roles) {
                const permissionActions: string[] =
                    rolePermissionMap[role.name as UserType] || [];

                // Convert actions to permission IDs where possible, otherwise keep action strings
                const permissionIdsOrActions = permissionActions
                    .map(
                        (action: string) =>
                            permissionsMap.get(action) || action,
                    )
                    .filter((v) => v);

                role.permissions = permissionIdsOrActions as any;
                await role.save();

                // Clear cache for users that have this role
                try {
                    const usersWithRole = await User.find({
                        roles: role._id,
                    }).select('_id');
                    for (const u of usersWithRole) {
                        try {
                            await PermissionService.clearUserCache(
                                String(u._id),
                            );
                        } catch (e) {
                            // ignore cache clear errors
                        }
                    }
                } catch (e) {
                    // ignore errors when clearing cache
                }
            }

            logger.log({
                data: 'Permissions assigned to roles successfully',
                type: 'info',
            });
        } else {
            logger.log({
                data: 'Permissions upserted. No role mapping available, roles not modified.',
                type: 'info',
            });
        }
    } catch (error) {
        logger.log({
            label: 'SEEDING_ERROR',
            data: `Permission seeding failed: ${(error as Error).message}`,
            type: 'error',
        });
        throw error;
    }
};

export default seedPermissions;
