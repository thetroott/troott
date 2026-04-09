import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import adminService from './admin.service';
import adminRepository from './admin.repository';
import {
    CreateAdminDTO,
    UpdateAdminDTO,
    InviteAdminDTO,
    AcceptAdminInvitationDTO,
    SetAdminPasswordDTO,
} from './admin.dto';
import { InvitationType } from '../../platform/Invitation/invitation.interface';
import { InviteTokenDTO } from '../../platform/Invitation/invitation.dto';
import invitationService from '../../platform/Invitation/invitation.service';
import emailService from '../../../services/email.service';
import { EMAIL_CONFIG } from '../../../configs/email.config';
import userRepository from '../user/user.repository';
import userService from '../user/user.service';
import authService from '../../authentication/auth/auth.service';
import redisWrapper from '../../../middlewares/redis.mdw';
import {
    PasswordType,
    UserType,
    IUserDoc,
    OnboardStatus,
} from '../user/user.interface';
import { genUserCode } from '../../../utils/code.util';
import { genSlug } from '../../../utils/helpers.util';
import roleService from '../../authentication/role/role.service';
import PermissionService from '../../authentication/permission/permission.service';
import { AdminDepartmentEnum, CompanyRoleEnum } from './admin.interface';
import { Types } from 'mongoose';

/**
 * @name inviteAdmin
 * @description Invites an admin to the system
 * @route POST /admin/invite
 * @access  Private (Admin only)
 */
export const inviteAdmin: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { email, resourceId }: InviteAdminDTO = req.body;

        if (!email || email.trim().length === 0)
            return next(new ErrorResponse('Email is required', 400, []));

        // Basic email validation
        const mailCheck = await authService.checkEmail(email);
        if (!mailCheck) {
            return next(new ErrorResponse('Invalid email format', 400, []));
        }

        // resourceId is optional for admin invitations

        const invitationResult = await invitationService.newInvitation({
            invitedBy: userId,
            inviteeEmail: email.trim().toLowerCase(),
            inviteType: InvitationType.ADMIN,
            resourceId: userId, // Use userId as default resourceId if not provided
        } as any);

        if (invitationResult.error) {
            return next(
                new ErrorResponse(
                    invitationResult.message,
                    invitationResult.code,
                    [],
                ),
            );
        }

        // Get the inviter's user details for email personalization
        const inviterResult = await userRepository.findById(userId);
        const inviter = inviterResult.data as any;

        // Extract token from invitation result
        const token = (invitationResult.data as any)?.token;
        if (!token) {
            return next(
                new ErrorResponse(
                    'Failed to generate invitation token',
                    500,
                    [],
                ),
            );
        }

        // Construct invitation URL with token
        const invitationUrl = `${EMAIL_CONFIG.clientUrl}/admin/invite/accept?token=${token}&email=${encodeURIComponent(email.trim().toLowerCase())}`;

        // Create a minimal user object for the invitee (they might not be a user yet)
        const inviteeUser = {
            email: email.trim().toLowerCase(),
            firstName: email.split('@')[0] || 'Admin', // Use email prefix as fallback
            lastName: '',
        } as any;

        // Send invitation email
        const emailResult = await emailService.sendInvitationEmail(
            inviteeUser,
            inviter?.firstName || 'A team member',
            invitationUrl,
            'Admin',
        );

        if (emailResult.error) {
            // Log error but don't fail the request since invitation was created
            console.error(
                'Failed to queue invitation email:',
                emailResult.message,
            );
        }

        res.status(201).json({
            error: false,
            errors: [],
            data: {
                ...invitationResult.data,
                emailQueued: !emailResult.error,
            },
            message:
                invitationResult.message ||
                'Admin invitation sent successfully.',
            status: 201,
        });
    },
);

/**
 * @name createAdmin
 * @description Creates a new admin profile (called after invitation is accepted)
 * @route POST /admin
 * @access  Private (Admin only)
 */
export const createAdmin: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        // Get user details
        const userResult = await userRepository.findById(String(userId));
        if (userResult.error || !userResult.data) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        const data: CreateAdminDTO = {
            ...req.body,
            user: userResult.data,
            createdBy: userId,
        };

        const result = await adminService.createAdmin(data);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code, []),
            );
        }

        res.status(201).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 201,
        });
    },
);

/**
 * @name getAdmin
 * @description Retrieves admin information by ID
 * @route GET /admin/:id
 * @access  Private (Admin only)
 */
export const getAdmin: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id)
            return next(new ErrorResponse('Admin ID is required', 400, []));

        const cacheKey = `admin:${id}`;
        const cacheTTL = 300; // 5 minutes

        // Check cache first
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Admin retrieved successfully (cached).',
                status: 200,
            });
        }

        // Get admin from service
        const result = await adminService.getAdmin(id);

        if (result.error || !result.data) {
            return next(
                new ErrorResponse(
                    result.message || 'Admin not found',
                    result.code || 404,
                    [],
                ),
            );
        }

        // Cache the result
        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            cacheTTL,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name getAdmins
 * @description Retrieves a paginated list of admins with filtering and sorting
 * @route GET /admins
 * @access  Private (Admin only)
 */
export const getAdmins: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            page = 1,
            limit = 25,
            sort = '-createdAt',
            select,
            populate,
            ...filters
        } = req.query;

        // Build cache key from query parameters
        const cacheKey = `admins:list:${JSON.stringify({ page, limit, sort, select, filters })}`;
        const cacheTTL = 180; // 3 minutes

        // Check cache first
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached.data,
                pagination: cached.pagination,
                count: cached.count,
                total: cached.total,
                message: 'Admins retrieved successfully (cached).',
                status: 200,
            });
        }

        // Build query options
        const options: any = {
            page: parseInt(String(page), 10),
            limit: parseInt(String(limit), 10),
            sort: String(sort),
        };

        if (select) {
            options.select = String(select);
        }

        if (populate) {
            options.populate = String(populate);
        }

        // Get admins from service
        const result = await adminService.getAdmins(
            filters as any,
            options,
        );

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Prepare response data
        const responseData = {
            data: result.data,
            pagination: result.pagination,
            count: result.pagination?.count,
            total: result.pagination?.total,
        };

        // Cache the result
        await redisWrapper.keepData(
            { key: cacheKey, value: responseData },
            cacheTTL,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            pagination: result.pagination,
            count: result.pagination?.count,
            total: result.pagination?.total,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name getAdminProfile
 * @description Retrieves admin profile for the authenticated admin
 * @route GET /admin
 * @access  Private (Admin only)
 */
export const getAdminProfile: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const cacheKey = `admin:profile:${userId}`;
        const cacheTTL = 300; // 5 minutes

        // Check cache first
        const cached = await redisWrapper.fetchData<any>(cacheKey);
        if (cached) {
            return res.status(200).json({
                error: false,
                errors: [],
                data: cached,
                message: 'Admin profile retrieved successfully (cached).',
                status: 200,
            });
        }

        // Get admin profile from service
        const result = await adminService.getAdminByUser(String(userId));

        if (result.error || !result.data) {
            return next(
                new ErrorResponse(
                    result.message || 'Admin profile not found',
                    result.code || 404,
                    [],
                ),
            );
        }

        // Cache the result
        await redisWrapper.keepData(
            { key: cacheKey, value: result.data },
            cacheTTL,
        );

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name updateAdmin
 * @description Updates admin profile information
 * @route PUT /admin/:id
 * @access  Private (Admin only)
 */
export const updateAdmin: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { id } = req.params;
        if (!id)
            return next(new ErrorResponse('Admin ID is required', 400, []));

        const data: UpdateAdminDTO = req.body;

        const result = await adminService.updateAdmin(id, data);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`admin:${id}`);
            await redisWrapper.deleteData(`admin:profile:${userId}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name deleteAdmin
 * @description Deletes an admin profile
 * @route DELETE /admin/:id
 * @access  Private (Super Admin only)
 */
export const deleteAdmin: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { id } = req.params;
        if (!id)
            return next(new ErrorResponse('Admin ID is required', 400, []));

        const result = await adminService.deleteAdmin(id);

        if (result.error) {
            return next(
                new ErrorResponse(result.message, result.code || 500, []),
            );
        }

        // Invalidate cache
        try {
            await redisWrapper.deleteData(`admin:${id}`);
        } catch (cacheError) {
            console.error('Cache invalidation failed:', cacheError);
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: result.data,
            message: result.message,
            status: 200,
        });
    },
);

/**
 * @name acceptAdminInvitation
 * @description Accepts an admin invitation and creates user account and profile
 * @route POST /admin/invite/accept
 * @access Public
 */
export const acceptAdminInvitation: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            token,
            email,
            password,
        }: AcceptAdminInvitationDTO = req.body;

        // Validate input
        if (!token || !email || !password) {
            return next(
                new ErrorResponse(
                    'Token, email, and password are required',
                    400,
                    [],
                ),
            );
        }

        // Validate email format
        const mailCheck = await authService.checkEmail(email);
        if (!mailCheck) {
            return next(new ErrorResponse('Invalid email format', 400, []));
        }

        // Validate password
        const passwordCheck = await authService.checkPassword(password);
        if (!passwordCheck) {
            return next(
                new ErrorResponse(
                    'Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number',
                    400,
                    [],
                ),
            );
        }

        // Validate invitation
        const validateResult = await invitationService.validateInvite({
            token,
            email: email.trim().toLowerCase(),
        });

        if (validateResult.error) {
            return next(
                new ErrorResponse(
                    validateResult.message,
                    validateResult.code,
                    [],
                ),
            );
        }

        const invitedBy = (validateResult.data as any)?.invitedBy;

        // Check if user exists
        let user: IUserDoc;
        const userExists = await userRepository.findOne({
            email: email.trim().toLowerCase(),
        });

        if (userExists.error === false && userExists.data) {
            // User exists, use existing user
            user = userExists.data as IUserDoc;
        } else {
            // Create user account manually (since userService.createUser throws error for ADMIN type)
            const userCode = genUserCode(UserType.ADMIN);
            const payload: Partial<IUserDoc> = {
                code: userCode,
                email: email.trim().toLowerCase(),
                password,
                passwordType: PasswordType.USERGENERATED,
                userType: UserType.USER, // Start with USER, will update to ADMIN
                createdBy: invitedBy,
                isActivated: false,
                isActive: false,
                onboard: {
                    step: 1,
                    status: OnboardStatus.NOT_STARTED,
                },
            };

            const createUserResult = await userRepository.createUser(payload);
            if (createUserResult.error) {
                return next(
                    new ErrorResponse(
                        createUserResult.message,
                        500,
                        [],
                    ),
                );
            }

            user = createUserResult.data as IUserDoc;

            // Update user type to ADMIN
            await authService.updateUserType(user, UserType.ADMIN);

            // Encrypt password
            await authService.encryptUserPassword(user, password);

            // Attach ADMIN role
            const attachRole = await roleService.attachRole(user, UserType.ADMIN);
            if (!attachRole.error && attachRole.data) {
                let updatedUser = attachRole.data as IUserDoc;

                // Initialize permissions for ADMIN role
                const permResult =
                    await PermissionService.initiatePermissionData(updatedUser);
                if (!permResult.error && permResult.data) {
                    updatedUser = permResult.data as IUserDoc;
                }

                // Update user reference
                user = updatedUser;

                // Clear permission cache
                const userId = updatedUser?._id || user._id;
                if (userId) {
                    await PermissionService.clearUserCache(String(userId));
                }
            }

            await user.save();
        }

        // Admin profile will be created via POST /admin endpoint or during onboarding
        // No need to create it here - can be created when they complete their profile

        // Activate account (no OTP needed since email is verified via invitation token)
        await authService.activateAccount(user);

        // Update login information
        await authService.updateLastLogin(user);

        res.status(201).json({
            error: false,
            errors: [],
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    userType: user.userType,
                },
            },
            message:
                'Account activated successfully. Please complete your profile setup.',
            status: 201,
        });
    },
);

/**
 * @name setAdminPassword
 * @description Sets password for an invited admin user
 * @route POST /admin/set-password
 * @access Private (for invited users who haven't set password yet)
 */
export const setAdminPassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        if (!userId) return next(new ErrorResponse('Unauthorized', 401, []));

        const { password }: SetAdminPasswordDTO = req.body;

        if (!password) {
            return next(
                new ErrorResponse('Password is required', 400, []),
            );
        }

        // Validate password
        const passwordCheck = await authService.checkPassword(password);
        if (!passwordCheck) {
            return next(
                new ErrorResponse(
                    'Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number',
                    400,
                    [],
                ),
            );
        }

        // Get user
        const userResult = await userRepository.findById(String(userId));
        if (userResult.error || !userResult.data) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        const user = userResult.data as IUserDoc;

        // Check if user is an admin
        if (user.userType !== UserType.ADMIN) {
            return next(
                new ErrorResponse('This endpoint is only for admin users', 403, []),
            );
        }

        // Encrypt and set password
        await authService.encryptUserPassword(user, password);
        user.passwordType = PasswordType.USERGENERATED;
        await user.save();

        // Send password change notification
        await emailService.sendPasswordChangeNotificationEmail(user);

        res.status(200).json({
            error: false,
            errors: [],
            data: {
                message: 'Password set successfully',
            },
            message: 'Password set successfully. Please proceed to onboarding.',
            status: 200,
        });
    },
);

/**
 * @name revokeAdminInvitation
 * @description Revokes an admin invitation
 * @route POST /admin/invite/revoke
 * @access Private
 */
export const revokeAdminInvitation: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { token, email }: InviteTokenDTO = req.body;

        if (!token || !email) {
            return next(
                new ErrorResponse('Token and email are required', 400, []),
            );
        }

        const revokeResult = await invitationService.revokeInvite({
            token,
            email: email.trim().toLowerCase(),
        });

        if (revokeResult.error) {
            return next(
                new ErrorResponse(
                    revokeResult.message,
                    revokeResult.code,
                    [],
                ),
            );
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: {},
            message:
                revokeResult.message || 'Admin invitation revoked successfully',
            status: 200,
        });
    },
);
