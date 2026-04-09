import User from "../../users/user/user.model";
import Role from "../role/role.model";
import mongoose from "mongoose";
import redisWrapper from "../../../middlewares/redis.mdw";
import { IResult } from "../../../utils/interfaces.util";
import { IRoleDoc } from "../role/role.interface";
import { IUserDoc } from "../../users/user/user.interface";
import { DbModels } from "../../../utils/enums.util";
import { GuestTypeEnum } from "../../users/guest/guest.interface";
import {
    getWorkspaceMemberRole,
    getProjectMemberRole,
    getHackathonMemberRole,
    isHackathonJudge,
    isHackathonMentor,
    isWorkspaceMentor,
    isWorkspaceJudge,
    getContextualPermissions,
    getHackathonFunctionalPermissions,
    getProjectMentorPermissions,
    getProjectJudgePermissions,
    getWorkspaceMentorPermissions,
    getWorkspaceJudgePermissions,
    matchPermission as matchPermissionUtil,
} from "../role/role.util";


const RBAC_USER_CACHE_KEY = (userId: string) => `rbac:perms:user:${userId}`;
const DEFAULT_TTL = Number(process.env.RBAC_CACHE_TTL || process.env.CACHE_TTL || 300);

/**
 * Normalize entity and action to permission string format (entity:action)
 */
function normalize(entity: string, action: string): string {
  return `${String(entity).toLowerCase()}:${String(action).toLowerCase()}`;
}

/**
 * Expand role permissions to array of lowercase permission strings
 */
async function expandRolePermissions(role: IRoleDoc): Promise<string[]> {
  return role.permissions ? role.permissions.map((p) => String(p).toLowerCase()) : [];
}


export async function resolveUserPermissions(userOrId: string | IUserDoc): Promise<Set<string>> {
  let user: IUserDoc | null = null;

  if (typeof userOrId === "string") {
    // check cache first
    const cacheKey = RBAC_USER_CACHE_KEY(userOrId);
    const cached = await redisWrapper.fetchData<string[]>(cacheKey);
    if (cached) return new Set(cached);

    user = await User.findById(userOrId).populate("roles").lean();
  } else {
    user = userOrId as IUserDoc;
    if (!user._id) throw new Error("Invalid user document");
  }

  if (!user) return new Set();

  // super users get wildcard
  if ((user as any).isSuper) {
    const wildcard = new Set(["*:*"]);
    // cache wildcard for the user
    await redisWrapper.keepData({ key: RBAC_USER_CACHE_KEY(String(user._id)), value: Array.from(wildcard) }, DEFAULT_TTL);
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
  await redisWrapper.keepData({ key: RBAC_USER_CACHE_KEY(String(user._id)), value: Array.from(perms) }, DEFAULT_TTL);

  return perms;
}


/**
 * Check if a user has a specific permission
 * Supports base role permissions, resource ownership, and contextual permissions
 */
export async function hasPermission(
  userOrId: string | IUserDoc,
  permOrEntity: string | { entity: string; action: string },
  options?: { 
    resourceOwnerId?: string | null; 
    checkOwnership?: boolean;
    resource?: any; // workspace/project/hackathon resource for contextual permissions
    resourceType?: 'workspace' | 'project' | 'hackathon' | 'entry' | 'squad';
  }
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

  // 1. Check base role permissions
  const rolePerms = await resolveUserPermissions(user);
  if (matchPermissionUtil(requested, rolePerms)) return true;

  // 2. Check resource ownership (if resource provided or resourceOwnerId provided)
  if (checkOwnership) {
    if (options?.resource?.createdBy) {
      const createdById = (options.resource.createdBy as any)?._id?.toString() || options.resource.createdBy?.toString();
      if (createdById === String(user._id)) {
        return true; // Owner gets full access
      }
    }
    if (options?.resourceOwnerId && String(user._id) === String(options.resourceOwnerId)) {
      return true; // Owner gets full access
    }
  }

  // 3. Check contextual role permissions (if resource provided)
  if (options?.resource && options?.resourceType) {
    let contextualPerms: string[] = [];

    // Get member role from resource
    switch (options.resourceType) {
      case 'workspace': {
        const memberRole = getWorkspaceMemberRole(user, options.resource);
        if (memberRole) {
          contextualPerms = getContextualPermissions('workspace', memberRole);
        }
        // Check workspace mentor/judge roles
        if (isWorkspaceMentor(user, options.resource)) {
          contextualPerms = [...contextualPerms, ...getWorkspaceMentorPermissions()];
        }
        if (isWorkspaceJudge(user, options.resource)) {
          contextualPerms = [...contextualPerms, ...getWorkspaceJudgePermissions()];
        }
        break;
      }
      case 'project': {
        const memberRole = getProjectMemberRole(user, options.resource);
        if (memberRole) {
          contextualPerms = getContextualPermissions('project', memberRole);
        }
        // Check project mentor/judge roles via guest profiles
        // We need to check if user has an active guest profile (type: MENTOR or JUDGE) for this project
        if (options.resource?._id) {
          const projectId = String(options.resource._id);
          const userId = String(user._id);
          
          // Check mentor guest profile - use mongoose.model() to safely get model if it exists
          try {
            const Guest = mongoose.models[DbModels.GUEST];
            if (Guest) {
              const mentorGuestProfile = await Guest.findOne({
                user: userId,
                projects: projectId,
                type: GuestTypeEnum.MENTOR,
                status: 'active',
              }).lean();
              if (mentorGuestProfile) {
                contextualPerms = [...contextualPerms, ...getProjectMentorPermissions()];
              }
            }
          } catch (err) {
            // Guest model might not exist yet, skip silently
          }
          
          // Check judge guest profile - use mongoose.model() to safely get model if it exists
          try {
            const Guest = mongoose.models[DbModels.GUEST];
            if (Guest) {
              const judgeGuestProfile = await Guest.findOne({
                user: userId,
                projects: projectId,
                type: GuestTypeEnum.JUDGE,
                status: 'active',
              }).lean();
              if (judgeGuestProfile) {
                contextualPerms = [...contextualPerms, ...getProjectJudgePermissions()];
              }
            }
          } catch (err) {
            // Guest model might not exist yet, skip silently
          }
        }
        break;
      }
      case 'hackathon': {
        // Check member role first
        const memberRole = getHackathonMemberRole(user, options.resource);
        if (memberRole) {
          contextualPerms = getContextualPermissions('hackathon', memberRole);
        }
        // Also check functional roles (judge, mentor)
        if (isHackathonJudge(user, options.resource)) {
          contextualPerms = [...contextualPerms, ...getHackathonFunctionalPermissions('JUDGE')];
        }
        if (isHackathonMentor(user, options.resource)) {
          contextualPerms = [...contextualPerms, ...getHackathonFunctionalPermissions('MENTOR')];
        }
        break;
      }
    }

    // Check if requested permission matches any contextual permission
    if (contextualPerms.length > 0 && matchPermissionUtil(requested, contextualPerms)) {
      return true;
    }
  }

  return false;
}

/**
 * Clear cached permissions for a user
 */
export async function clearUserCache(userId: string): Promise<void> {
  await redisWrapper.deleteData(RBAC_USER_CACHE_KEY(userId));
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

    // Assign role id (ensure roles is an array)
    if (!user.roles) {
      user.roles = [];
    }
    // Check if role is already assigned
    const roleId = role._id.toString();
    const existingRoleIndex = user.roles.findIndex(
      (r: any) => r?.toString() === roleId || r?._id?.toString() === roleId
    );
    if (existingRoleIndex === -1) {
      user.roles.push(role._id);
    }

    // Use role.permissions as the user's default permissions (User schema expects [ObjectId])
    if (Array.isArray(role.permissions)) {
      const toId = (p: any) => (p == null ? '' : typeof p === 'string' ? p : (p._id || p.id || p).toString());
      user.permissions = role.permissions
        .map(toId)
        .filter((id: string) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id));
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
    result.message = err?.message;
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
      result.message = err?.message;
      return result;
    }
  },
};