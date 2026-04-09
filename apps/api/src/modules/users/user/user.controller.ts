import { Request, Response, NextFunction, RequestHandler } from "express";
import asyncHandler from "../../../middlewares/async.mdw";
import ErrorResponse from '../../../utils/error.util';
import authMapper from "../../authentication/auth/auth.mapper";
import userService from './user.service';
import userRepository from './user.repository';
import { IUserDoc } from './user.interface';
import {
  OnboardUserTypeDTO,
  OnboardBasicInfoDTO,
  OnboardTalentInfoDTO,
  OnboardBusinessInfoDTO,
  OnboardUserInfoDTO,
} from "../../authentication/auth/auth.dto";
import redisWrapper from "../../../middlewares/redis.mdw";

/** Get authenticated user id from request (supports both id and _id from lean() documents) */
const getUserId = (req: Request): string | undefined =>
  (req as any).user?.id ?? (req as any).user?._id?.toString?.() ?? (req as any).user?._id;

/**
 * @name getUser
 * @description Retrieves user information excluding email, password, and permission settings
 * @route GET /user
 * @access  Private
 */
export const getUser: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const userId = getUserId(req);
    if (!userId) return next(new ErrorResponse("Unauthorized", 401, []));

    const cacheKey = `user:profile:${userId}`;
    const cacheTTL = 300; // 5 minutes for user profile data

      // Check cache first
      const cached = await redisWrapper.fetchData<any>(cacheKey);
      if (cached) {
        return res.status(200).json({
          error: false,
          errors: [],
          data: cached,
          message: "User information retrieved successfully (cached).",
          status: 200,
        });
      }

      // Find the user by ID using repository
      const userResult = await userRepository.findById(String(userId), false);
      if (userResult.error || !userResult.data) {
        return next(new ErrorResponse("User not found", 404, []));
      }

      const user = userResult.data as IUserDoc;

      // Map the user information to include only the specified fields
      const userInfo = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        phoneCode: user.phoneCode || '',
        activated: user.isActivated || false,
      };

      // Cache the result
      await redisWrapper.keepData(
        { key: cacheKey, value: userInfo },
        cacheTTL
      );

      res.status(200).json({
        error: false,
        errors: [],
        data: userInfo,
        message: "User information retrieved successfully.",
        status: 200,
      });
    
  }
);

/**
 * @name getUsers
 * @description Retrieves a paginated list of users with filtering and sorting
 * @route GET /users
 * @access  Private (Admin only - should add admin check)
 */
export const getUsers: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const {
      page = 1,
      limit = 25,
      sort = "-createdAt",
      select,
      populate,
      ...filters
    } = req.query;

    // Build cache key from query parameters
    const cacheKey = `users:list:${JSON.stringify({ page, limit, sort, select, filters })}`;
    const cacheTTL = 180; // 3 minutes for user lists (shorter than individual profiles)

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
          message: "Users retrieved successfully (cached).",
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

      // Get users from repository
      const result = await userRepository.getUsers(filters as any, options);

      if (result.error) {
        return next(new ErrorResponse(result.message, result.code || 500, []));
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
        cacheTTL
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
    
  }
);



/**
 * @name deactivateAccount
 * @description Deactivates the user account
 * @route DELETE /user/deactivate
 * @access  Private
 */
export const deactivateAccount: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    if (!userId) return next(new ErrorResponse("Unauthorized", 401, []));

    // Find the user by ID using repository
    const userResult = await userRepository.findById(String(userId), false);
    if (userResult.error || !userResult.data) {
      return next(new ErrorResponse("User not found", 404, []));
    }

    // Deactivate the user account using repository
    const updateResult = await userRepository.updateUser(String(userId), {
      isDeactivated: true,
    } as Partial<IUserDoc>);

    if (updateResult.error) {
      return next(new ErrorResponse(updateResult.message, updateResult.code || 500, []));
    }

    // Invalidate cache for this user
    try {
      await redisWrapper.deleteData(`user:profile:${userId}`);
      // Also invalidate any list caches that might include this user
      // Note: In production, you might want to use pattern matching or maintain a cache key registry
    } catch (cacheError) {
      // Silently fail cache invalidation - don't break the request
      console.error("Cache invalidation failed:", cacheError);
    }

    res.status(200).json({
      error: false,
      errors: [],
      message: "User account deactivated successfully.",
      status: 200,
    });
  }
);



/**
 * @name getOnboardingStatus
 * @description Get current onboarding status and progress
 * @route GET /user/onboard/status
 * @access Private (Authenticated users only)
 */
export const getOnboardingStatus: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    if (!userId) {
      return next(new ErrorResponse("Unauthorized", 401, []));
    }

    const result = await userService.getOnboardingStatus(userId);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 400, []));
    }

    res.status(200).json({
      error: false,
      message: result.message,
      status: 200,
      errors: [],
      data: result.data,
    });
  }
);

// New meaningful controller names
/**
 * @name setUserType
 * @description Set user type (TALENT or BUSINESS) - meaningful name
 * @route POST /user/onboard/user-type
 * @access Private (Authenticated users only)
 */
export const setUserType: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    if (!userId) {
      return next(new ErrorResponse("Unauthorized", 401, []));
    }

    const data: OnboardUserTypeDTO = req.body;

    const result = await userService.setUserType(userId, data);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 400, []));
    }

    res.status(200).json({
      error: false,
      message: result.message,
      status: 200,
      errors: [],
      data: result.data,
    });
  }
);

/**
 * @name setBasicInfo
 * @description Set basic user information - meaningful name
 * @route POST /user/onboard/basic-info
 * @access Private (Authenticated users only)
 */
export const setBasicInfo: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    if (!userId) {
      return next(new ErrorResponse("Unauthorized", 401, []));
    }

    const data: OnboardBasicInfoDTO = req.body;

    const result = await userService.setBasicInfo(userId, data);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 400, []));
    }

    res.status(200).json({
      error: false,
      message: result.message,
      status: 200,
      errors: [],
      data: result.data,
    });
  }
);

/**
 * @name setTalentInfo
 * @description Set talent-specific information - meaningful name
 * @route POST /user/onboard/talent-info
 * @access Private (Authenticated users with TALENT type only)
 */
export const setTalentInfo: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    if (!userId) {
      return next(new ErrorResponse("Unauthorized", 401, []));
    }

    const data: OnboardTalentInfoDTO = req.body;

    const result = await userService.setTalentInfo(userId, data);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 400, []));
    }

    res.status(200).json({
      error: false,
      message: result.message,
      status: 200,
      errors: [],
      data: result.data,
    });
  }
);

/**
 * @name setBusinessInfo
 * @description Set business-specific information - meaningful name
 * @route POST /user/onboard/business-info
 * @access Private (Authenticated users with BUSINESS type only)
 */
export const setBusinessInfo: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    if (!userId) {
      return next(new ErrorResponse("Unauthorized", 401, []));
    }

    const data: OnboardBusinessInfoDTO = req.body;

    const result = await userService.setBusinessInfo(userId, data);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 400, []));
    }

    res.status(200).json({
      error: false,
      message: result.message,
      status: 200,
      errors: [],
      data: result.data,
    });
  }
);

/**
 * @name setUserInfo
 * @description Set user information (specialty, role, discovery) - works for all user types
 * @route POST /user/onboard/user-info
 * @access Private (Authenticated users only)
 */
export const setUserInfo: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    if (!userId) {
      return next(new ErrorResponse("Unauthorized", 401, []));
    }

    const data: OnboardUserInfoDTO = req.body;

    const result = await userService.setUserInfo(userId, data);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 400, []));
    }

    res.status(200).json({
      error: false,
      message: result.message,
      status: 200,
      errors: [],
      data: result.data,
    });
  }
);

/**
 * @name completeOnboarding
 * @description Complete onboarding process - meaningful name
 * @route POST /user/onboard/complete
 * @access Private (Authenticated users only)
 */
export const completeOnboarding: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    if (!userId) {
      return next(new ErrorResponse("Unauthorized", 401, []));
    }

    const result = await userService.completeOnboarding(userId);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 400, []));
    }

    res.status(200).json({
      error: false,
      message: result.message,
      status: 200,
      errors: [],
      data: result.data,
    });
  }
);



    // create user
    // get all user account 
    // get user account by id
    // update user account
    // deactivate user account
    // suspend user account
    // delete user account
    // get user preferences
    // update user preferences
    // create user preferences

    // follow a user
    // unfollow a user

    // switch user profile
    // update user roles & permissions.
    // update user account details
    // update user account status
