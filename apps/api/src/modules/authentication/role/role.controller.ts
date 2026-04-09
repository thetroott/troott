import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import roleService from './role.service';
import roleRepository from './role.repository';
import { CreateRoleDTO, UpdateRoleDTO, AttachRoleDTO, AssignWorkspaceRoleDTO, AssignProjectRoleDTO } from './role.dto';
import redisWrapper from '../../../middlewares/redis.mdw';
import userRepository from '../../users/user/user.repository';
import { IUserDoc, UserType } from '../../users/user/user.interface';
import { Types } from 'mongoose';
import { WorkspaceMemberRole } from '../../core/workspace/workspace.interface';
import { ProjectMemberRole } from '../../projects/project/project.interface';
import workspaceRepository from '../../core/workspace/workspace.repository';
import projectRepository from '../../projects/project/project.repository';

/**
 * @name createRole
 * @description Creates a new role
 * @route POST /roles
 * @access Private
 */
export const createRole: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const data: CreateRoleDTO = {
            ...req.body,
        };

        // Prevent creating superadmin role (system can only have one superadmin)
        if (data.name === UserType.SUPERADMIN || data.name === 'super-admin') {
            return next(
                new ErrorResponse(
                    'Cannot create superadmin role. System can only have one superadmin.',
                    400,
                    [],
                ),
            );
        }

        const result = await roleRepository.createRole(data);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(201).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message || 'Role created successfully',
            status: 201,
        });
    },
);

/**
 * @name getRole
 * @description Retrieves role information by ID or slug
 * @route GET /roles/:id
 * @access Private
 */
export const getRole: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) return next(new ErrorResponse('Role ID is required', 400, []));

        const cacheKey = `role:${id}`;
        const cacheTTL = 300;

        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Role retrieved successfully (cached).',
                status: 200,
            });
        }

        const result = await roleRepository.findRole(id);

        if (result.error || !result.data) {
            return next(
                new ErrorResponse(result.message, result.code || 404, []),
            );
        }

        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            cacheTTL,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message || 'Role retrieved successfully',
            status: 200,
        });
    },
);

/**
 * @name getRoles
 * @description Retrieves all roles with optional filtering and pagination
 * @route GET /roles
 * @access Private
 */
export const getRoles: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const options = {
            select: req.query.select as string | undefined,
            sort: (req.query.sort as string) || '-createdAt',
            page: req.query.page
                ? parseInt(req.query.page as string)
                : undefined,
            limit: req.query.limit
                ? parseInt(req.query.limit as string)
                : undefined,
            populate: req.query.populate as string | undefined,
        };

        const filter = { ...req.query };
        delete (filter as any).select;
        delete (filter as any).sort;
        delete (filter as any).page;
        delete (filter as any).limit;
        delete (filter as any).populate;

        const result = await roleRepository.getRoles(filter, options);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message || 'Roles retrieved successfully',
            status: 200,
            pagination: result.pagination,
        });
    },
);

/**
 * @name updateRole
 * @description Updates role information
 * @route PUT /roles/:id
 * @access Private
 */
export const updateRole: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) return next(new ErrorResponse('Role ID is required', 400, []));

        const data: UpdateRoleDTO = {
            ...req.body,
        };

        const result = await roleRepository.updateRole(id, data);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        // Clear cache
        await redisWrapper.deleteData(`role:${id}`);

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message || 'Role updated successfully',
            status: 200,
        });
    },
);

/**
 * @name deleteRole
 * @description Deletes a role
 * @route DELETE /roles/:id
 * @access Private
 */
export const deleteRole: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) return next(new ErrorResponse('Role ID is required', 400, []));

        const result = await roleRepository.deleteRole(id);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        // Clear cache
        await redisWrapper.deleteData(`role:${id}`);

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message || 'Role deleted successfully',
            status: 200,
        });
    },
);

/**
 * @name getUserRoles
 * @description Gets all roles for a user
 * @route GET /roles/user/:userId
 * @access Private
 */
export const getUserRoles: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;
        if (!userId)
            return next(new ErrorResponse('User ID is required', 400, []));

        const result = await roleService.getUserRoles(userId);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message || 'User roles retrieved successfully',
            status: 200,
        });
    },
);

/**
 * @name attachRoleToUser
 * @description Attaches a role to a user
 * @route POST /roles/user/:userId/attach
 * @access Private
 */
export const attachRoleToUser: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;
        if (!userId)
            return next(new ErrorResponse('User ID is required', 400, []));

        const data: AttachRoleDTO = req.body;
        if (!data.roleName)
            return next(new ErrorResponse('Role name is required', 400, []));

        const userResult = await userRepository.findById(userId);
        if (userResult.error || !userResult.data) {
            return next(
                new ErrorResponse('User not found', userResult.code || 404, []),
            );
        }

        const user = userResult.data as IUserDoc;
        const result = await roleService.attachRole(user, data.roleName);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message || 'Role attached successfully',
            status: 200,
        });
    },
);

/**
 * @name detachRoleFromUser
 * @description Detaches a role from a user
 * @route DELETE /roles/user/:userId/detach
 * @access Private
 */
export const detachRoleFromUser: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;
        if (!userId)
            return next(new ErrorResponse('User ID is required', 400, []));

        const data: AttachRoleDTO = req.body;
        if (!data.roleName)
            return next(new ErrorResponse('Role name is required', 400, []));

        const userResult = await userRepository.findById(userId);
        if (userResult.error || !userResult.data) {
            return next(
                new ErrorResponse('User not found', userResult.code || 404, []),
            );
        }

        const user = userResult.data as IUserDoc;
        const result = await roleService.detachRole(user, data.roleName);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message || 'Role detached successfully',
            status: 200,
        });
    },
);

/**
 * @name assignWorkspaceRole
 * @description Assigns a contextual role to a user in a workspace
 * @route POST /roles/workspace/:workspaceId/assign
 * @access Private
 */
export const assignWorkspaceRole: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { workspaceId } = req.params;
        if (!workspaceId)
            return next(new ErrorResponse('Workspace ID is required', 400, []));

        const data: AssignWorkspaceRoleDTO = req.body;
        if (!data.userId)
            return next(new ErrorResponse('User ID is required', 400, []));
        if (!data.role)
            return next(new ErrorResponse('Role is required', 400, []));

        // Validate role enum
        if (!Object.values(WorkspaceMemberRole).includes(data.role)) {
            return next(new ErrorResponse('Invalid workspace member role', 400, []));
        }

        // Check if workspace exists
        const workspaceResult = await workspaceRepository.findById(workspaceId);
        if (workspaceResult.error || !workspaceResult.data) {
            return next(
                new ErrorResponse('Workspace not found', workspaceResult.code || 404, []),
            );
        }

        const workspace = workspaceResult.data as any;
        
        // Check if user is already a member
        const existingMember = workspace.members?.find(
            (m: any) => String(m.user) === data.userId || String(m.user?._id) === data.userId,
        );
        if (existingMember) {
            return next(
                new ErrorResponse('User is already a member of this workspace', 400, []),
            );
        }

        // Add member with role using $addToSet
        const updateResult = await workspaceRepository.updateWorkspace(workspaceId, {
            $addToSet: {
                members: {
                    user: new Types.ObjectId(data.userId),
                    role: data.role,
                    joinedAt: new Date(),
                },
            },
        } as any);

        if (updateResult.error) {
            return next(new ErrorResponse(updateResult.message, updateResult.code, []));
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`workspace:${workspaceId}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: updateResult.data,
            message: 'Workspace role assigned successfully',
            status: 200,
        });
    },
);

/**
 * @name removeWorkspaceRole
 * @description Removes a user's contextual role from a workspace
 * @route DELETE /roles/workspace/:workspaceId/user/:userId
 * @access Private
 */
export const removeWorkspaceRole: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { workspaceId, userId } = req.params;
        if (!workspaceId)
            return next(new ErrorResponse('Workspace ID is required', 400, []));
        if (!userId)
            return next(new ErrorResponse('User ID is required', 400, []));

        // Check if workspace exists
        const workspaceResult = await workspaceRepository.findById(workspaceId);
        if (workspaceResult.error || !workspaceResult.data) {
            return next(
                new ErrorResponse('Workspace not found', workspaceResult.code || 404, []),
            );
        }

        // Remove member using $pull
        const updateResult = await workspaceRepository.updateWorkspace(workspaceId, {
            $pull: {
                members: {
                    user: new Types.ObjectId(userId),
                },
            },
        } as any);

        if (updateResult.error) {
            return next(new ErrorResponse(updateResult.message, updateResult.code, []));
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`workspace:${workspaceId}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: updateResult.data,
            message: 'Workspace role removed successfully',
            status: 200,
        });
    },
);

/**
 * @name assignProjectRole
 * @description Assigns a contextual role to a user in a project
 * @route POST /roles/project/:projectId/assign
 * @access Private
 */
export const assignProjectRole: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { projectId } = req.params;
        if (!projectId)
            return next(new ErrorResponse('Project ID is required', 400, []));

        const data: AssignProjectRoleDTO = req.body;
        if (!data.userId)
            return next(new ErrorResponse('User ID is required', 400, []));
        if (!data.role)
            return next(new ErrorResponse('Role is required', 400, []));

        // Validate role enum
        if (!Object.values(ProjectMemberRole).includes(data.role)) {
            return next(new ErrorResponse('Invalid project member role', 400, []));
        }

        // Import project service dynamically to avoid circular dependency
        const projectService = (await import('../../projects/project/project.service')).default;
        
        const result = await projectService.addMember(projectId, data.userId, data.role);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`project:${projectId}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message || 'Project role assigned successfully',
            status: 200,
        });
    },
);

/**
 * @name removeProjectRole
 * @description Removes a user's contextual role from a project
 * @route DELETE /roles/project/:projectId/user/:userId
 * @access Private
 */
export const removeProjectRole: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { projectId, userId } = req.params;
        if (!projectId)
            return next(new ErrorResponse('Project ID is required', 400, []));
        if (!userId)
            return next(new ErrorResponse('User ID is required', 400, []));

        // Import project service dynamically to avoid circular dependency
        const projectService = (await import('../../projects/project/project.service')).default;
        
        const result = await projectService.removeMember(projectId, userId);

        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`project:${projectId}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message || 'Project role removed successfully',
            status: 200,
        });
    },
);
