import fs from "fs";

import Permission from "../../models/Permission.model";
import Role from "../../models/Role.model";
import { UserType } from "../../utils/enums.util";
import PermissionService from "../../services/permission.service";
import logger from "../../utils/logger.util";
import User from "../../models/User.model";

/**
 * @description Reads and parses the permissions data from JSON file
 * @type {Object} permissionsData - Contains array of permission objects
 */
const permissionsData = JSON.parse(
  fs.readFileSync(
    `${__dirname.split("config")[0]}_data/permissions.json`,
    "utf-8"
  )
);

/**
 * @description Seeds the permissions collection in the database
 * @async
 * @function seedPermissions
 * @returns {Promise<void>}
 * @throws {Error} If there's an error reading the file or inserting data
 */
const seedPermissions = async () => {
  try {
    const upserted: Array<any> = [];

    for (const perm of permissionsData) {
      const doc = await Permission.findOneAndUpdate(
        { action: perm.action },
        { $set: { description: perm.description } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (doc) upserted.push(doc);
    }

    logger.log({
      data: `${upserted.length} permissions upserted successfully`,
      type: "info",
    });

    // If a rolePermissionMap is available on PermissionService, map role names to actions
    if ((PermissionService as any).rolePermissionMap && typeof (PermissionService as any).rolePermissionMap === "object") {
      const permissionsMap = new Map((await Permission.find({})).map((p) => [p.action, p._id]));
      const roles = await Role.find({});

      for (const role of roles) {
        const permissionActions: string[] = (PermissionService as any).rolePermissionMap[role.name as UserType] || [];

        // Convert actions to permission IDs where possible, otherwise keep action strings
        const permissionIdsOrActions = permissionActions
          .map((action) => permissionsMap.get(action) || action)
          .filter((v) => v);

        role.permissions = permissionIdsOrActions as any;
        await role.save();

          // Clear cache for users that have this role
          try {
            
            const usersWithRole = await User.find({ roles: role._id }).select("_id");
            for (const u of usersWithRole) {
              try {
                await (PermissionService as any).clearUserCache(String(u._id));
              } catch (e) {
                // ignore cache clear errors
              }
            }
          } catch (e) {
            // ignore errors when clearing cache
          }
      }

      logger.log({ data: "Permissions assigned to roles successfully", type: "info" });
    } else {
      logger.log({ data: "Permissions upserted. No role mapping available, roles not modified.", type: "info" });
    }
  } catch (error) {
    logger.log({ label: "SEEDING_ERROR", data: (error as Error).message, type: "error" });
  }
};

export default seedPermissions;
