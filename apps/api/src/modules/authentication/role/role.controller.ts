import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import roleService from './role.service';
import roleRepository from './role.repository';
import {
    CreateRoleDTO,
    UpdateRoleDTO,
    AttachRoleDTO,
} from './role.dto';
import redisWrapper from '../../../middlewares/redis.mdw';
import userRepository from '../../users/user/user.repository';
import { IUserDoc, UserType } from '../../users/user/user.interface';

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
        const id = String(req.params.id || '');
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
            pagination: (result as { pagination?: unknown }).pagination,
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
        const id = String(req.params.id || '');
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
        const id = String(req.params.id || '');
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
        const userId = String(req.params.userId || '');
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
        const userId = String(req.params.userId || '');
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
        const userId = String(req.params.userId || '');
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
