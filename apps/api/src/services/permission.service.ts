// import User from "@/models/User.model";
// import Role from "@/models/Role.model";
// import redisHandler from "@/middlewares/redis.mdw";
// import { IRoleDoc, IUserDoc, IResult } from "@/utils/interfaces.util";

import { IResult, IRoleDoc, IUserDoc } from "../utils/interfaces.util";
import redisHandler from "../middlewares/redis.mdw"
import User from "../models/User.model";
import Role from "../models/Role.model";

const RBAC_USER_CACHE_KEY = (userId: string) => `rbac:perms:user:${userId}`;
const DEFAULT_TTL = Number(process.env.RBAC_CACHE_TTL || process.env.CACHE_TTL || 300);

function normalize(entity: string, action: string) {
  return `${String(entity).toLowerCase()}:${String(action).toLowerCase()}`;
}

async function expandRolePermissions(role: IRoleDoc): Promise<string[]> {
  // role.permissions is an array of canonical strings already
  return role.permissions ? role.permissions.map((p) => String(p).toLowerCase()) : [];
}

export async function resolveUserPermissions(userOrId: string | IUserDoc): Promise<Set<string>> {
  let user: IUserDoc | null = null;

  if (typeof userOrId === "string") {
    // check cache first
    const cacheKey = RBAC_USER_CACHE_KEY(userOrId);
    const cached = await redisHandler.fetchData<string[]>(cacheKey);
    if (cached) return new Set(cached);

    user = await User.findById(userOrId).populate("roles");
  } else {
    user = userOrId as IUserDoc;
    if (!user._id) throw new Error("Invalid user document");
  }

  if (!user) return new Set();

  // super users get wildcard
  if ((user as any).isSuper) {
    const wildcard = new Set(["*:*"]);
    // cache wildcard for the user
    await redisHandler.keepData({ key: RBAC_USER_CACHE_KEY(String(user._id)), value: Array.from(wildcard) }, DEFAULT_TTL);
    return wildcard;
  }

  const perms = new Set<string>();

  // user-level permissions (explicit grants)
  if (user.permissions && Array.isArray(user.permissions)) {
    for (const p of user.permissions) perms.add(String(p).toLowerCase());
  }

  // role permissions
  const roles: Array<IRoleDoc> = (user as any).roles || [];
  for (const r of roles) {
    const expanded = await expandRolePermissions(r as IRoleDoc);
    for (const p of expanded) perms.add(p);
  }

  // cache
  await redisHandler.keepData({ key: RBAC_USER_CACHE_KEY(String(user._id)), value: Array.from(perms) }, DEFAULT_TTL);

  return perms;
}

function matchPermission(requested: string, perms: Set<string>): boolean {
  requested = requested.toLowerCase();
  if (perms.has("*:*")) return true; // global wildcard
  if (perms.has(requested)) return true;

  // wildcard checks: entity:* or *:action
  const [entity, action] = requested.split(":");
  if (perms.has(`${entity}:*`)) return true;
  if (perms.has(`*:${action}`)) return true;

  return false;
}

export async function hasPermission(
  userOrId: string | IUserDoc,
  permOrEntity: string | { entity: string; action: string },
  options?: { resourceOwnerId?: string | null; checkOwnership?: boolean }
): Promise<boolean> {
  const checkOwnership = options?.checkOwnership ?? true;

  let user: IUserDoc | null = null;
  if (typeof userOrId === "string") {
    user = await User.findById(userOrId).populate("roles").exec();
  } else {
    user = userOrId as IUserDoc;
  }

  if (!user) return false;

  if ((user as any).isSuper) return true;

  const requested = typeof permOrEntity === "string" ? permOrEntity : normalize(permOrEntity.entity, permOrEntity.action);

  // ownership short-circuit: if user owns the resource and checkOwnership is enabled
  if (checkOwnership && options?.resourceOwnerId && String(user._id) === String(options.resourceOwnerId)) {
    // allow ownership for update/read/delete by default
    return true;
  }

  const perms = await resolveUserPermissions(user);
  return matchPermission(requested, perms);
}

export async function clearUserCache(userId: string): Promise<void> {
  await redisHandler.deleteData(RBAC_USER_CACHE_KEY(userId));
}

/**
 * Initialize default permissions for a new user based on their role.
 * Attaches the role to the user and copies role.permissions into user.permissions.
 */
export async function initiatePermissionData(user: IUserDoc): Promise<IResult> {
  const result: IResult = { error: false, message: '', code: 200, data: {} };
  try {
    // find role by userType (role names are stored as strings matching userType)
    const role = await Role.findOne({ name: user.userType });
    if (!role) {
      result.error = true;
      result.code = 404;
      result.message = `Role not found for user type: ${user.userType}`;
      return result;
    }

    // Assign role id
    user.roles = role._id as any;

    // Use role.permissions as the user's default permissions
    if (Array.isArray(role.permissions)) {
      user.permissions = role.permissions.map((p: any) => String(p));
    } else {
      user.permissions = [] as any;
    }

    await user.save();
    result.data = user;
    result.message = 'Permissions initialized';
    return result;
  } catch (err: any) {
    result.error = true;
    result.code = 500;
    result.message = err?.message || 'Failed to initiate permission data';
    return result;
  }
}

export default {
  resolveUserPermissions,
  hasPermission,
  clearUserCache,
  initiatePermissionData,
  // Backwards compatible: updatePermissions was referenced in several places.
  async updatePermissions(user: IUserDoc, permissionPayload: any): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    try {
      const role = await Role.findOne({ _id: permissionPayload.role || user.roles?.[0] });
      if (!role) {
        result.error = true;
        result.code = 400;
        result.message = "Invalid user role";
        return result;
      }

      const invalidPermissions = (permissionPayload.permissions || []).filter(
        (p: string) => !role.permissions.includes(p)
      );

      if (invalidPermissions.length > 0) {
        result.error = true;
        result.code = 400;
        result.message = `Invalid permissions for role ${role.name}: ${invalidPermissions.join(", ")}`;
        return result;
      }

      // Assign validated permissions to user and persist
      user.permissions = permissionPayload.permissions;
      await user.save();

      result.data = user;
      result.message = "Permissions updated successfully";
      return result;
    } catch (err: any) {
      result.error = true;
      result.code = 500;
      result.message = err?.message || "Failed to update permissions";
      return result;
    }
  },
};
