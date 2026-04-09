import { NextFunction, Request, Response, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import {
    ChangePasswordDTO,
    LoginDTO,
    RegisterUserDTO,
    ResendOtpDTO,
    ResetPasswordDTO,
    VerifyOtpDTO,
} from './auth.dto';
import authService from './auth.service';
import {
    OtpType,
    PasswordType,
    UserType,
} from '../../users/user/user.interface';
import emailService from '../../../services/email.service';
import tokenService from '../../../services/token.service';
import { IUserDoc } from '../../users/user/user.interface';
import userService from '../../users/user/user.service';

import userRepository from '../../users/user/user.repository';
import User from '../../users/user/user.model';
import authMapper from './auth.mapper';

/**
 * @name registerUser
 * @description Registers a new user
 * @route POST /auth/register
 * @access Public
 * @returns registered user
 */
export const registerUser: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password, userType }: RegisterUserDTO = req.body;

        const validate = await authService.validateRegister(req.body);
        if (validate.error) {
            return next(
                new ErrorResponse(validate.message, validate.code!, []),
            );
        }

        const mailCheck = await authService.checkEmail(email);
        if (!mailCheck) {
            return next(new ErrorResponse('Invalid email format', 400, []));
        }

        // Check if the user already exists
        const userExits = await userRepository.findOne({
            email: email.toLowerCase(),
        });
        if (userExits.error === false && userExits.data) {
            const userExist = userExits.data as IUserDoc;

            if (userExist.userType === UserType.SUPERADMIN) {
                return next(
                    new ErrorResponse('Forbidden!, use another email', 400, []),
                );
            }

            return next(
                new ErrorResponse(
                    'User already exist, use another email',
                    400,
                    [],
                ),
            );
        }

        const passwordCheck = await authService.checkPassword(password);
        if (!passwordCheck) {
            return next(
                new ErrorResponse(
                    'password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number',
                    400,
                    [],
                ),
            );
        }

        const user = await userService.createUser({
            email,
            password,
            passwordType: PasswordType.USERGENERATED,
            userType: userType as UserType,
        });
        if (!user) {
            return next(new ErrorResponse('user not created', 404, []));
        }

        const Otp = await authService.generateOTPCode(user, OtpType.REGISTER);

        if (Otp) {
            const sendOTP = await emailService.sendOTPEmail({
                user,
                code: Otp,
                otpType: OtpType.REGISTER,
            });

            if (sendOTP.error) {
                return next(
                    new ErrorResponse(sendOTP.message, sendOTP.code!, []),
                );
            }
        }

        const mappedUser = await authMapper.mapRegisteredUser(user);

        res.status(200).json({
            error: false,
            errors: [],
            data: mappedUser,
            message: 'OTP has been sent to your email!',
            status: 200,
        });
    },
);

/**
 * @name activateUserAccount
 * @description Activates a user account using OTP
 * @route POST /auth/activate
 * @access Public
 */
export const activateUserAccount: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp, otpType }: VerifyOtpDTO = req.body;

        if (!email || !otp || !otpType) {
            return next(
                new ErrorResponse(
                    'Email, OTP and OtpType are required',
                    400,
                    [],
                ),
            );
        }

        // use OTP to find the user
        const userResult = await userRepository.findOne({
            email: email.toLowerCase(),
        });
        if (userResult.error || !userResult.data) {
            return next(new ErrorResponse('User not found', 404, []));
        }
        const user = userResult.data as IUserDoc;

        // Check if account is already active
        if (user.isActive) {
            return next(
                new ErrorResponse('Account is already activated', 400, []),
            );
        }

        const otpVerification = await authService.verifyOTP({
            email: user.email,
            otp: otp,
            otpType,
        });
        if (otpVerification.error) {
            return next(
                new ErrorResponse(
                    otpVerification.message,
                    otpVerification.code!,
                    [],
                ),
            );
        }

        // Get Mongoose document for operations that need .save()
        const userDoc = await User.findById(user._id);
        if (!userDoc) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        // Activate the user account and Update login information
        await authService.activateAccount(userDoc);
        await authService.updateLastLogin(userDoc);
        //await authService.updateLoginInfo(userDoc, req);

        // Generate authentication token
        const token = await tokenService.attachToken(userDoc);
        if (token.error) {
            return next(new ErrorResponse(token.message, token.code!, []));
        }

        const mappedUser = await authMapper.mapActivatedUser(userDoc);

        // Include token in response
        const responseData = {
            ...mappedUser,
            token: token.data.token,
        };

        res.status(200).json({
            error: false,
            errors: [],
            data: responseData,
            message: 'Account activated successfully!',
            status: 200,
        });
    },
);

/**
 * @name loginUser
 * @description Logs in a user
 * @route POST /auth/login
 * @access Public
 */
export const loginUser: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password }: LoginDTO = req.body;

        const validate = await authService.validateLogin(req.body);
        if (validate.error) {
            return next(
                new ErrorResponse(validate.message, validate.code!, []),
            );
        }

        const userExits = await userRepository.findOne(
            { email: email.toLowerCase() },
            { select: '+password' } as any,
        );
        if (userExits.error || !userExits.data) {
            return next(
                new ErrorResponse(
                    'Account not found. Please sign up first.',
                    400,
                    [],
                ),
            );
        }
        const userExist = userExits.data as IUserDoc;

        // Check if account is locked
        if (await authService.checkLockedStatus(userExist)) {
            return next(
                new ErrorResponse(
                    'Account is locked. Please try again later',
                    423,
                    [],
                ),
            );
        }

        // Check if account is deactivated
        if (userExist.isDeactivated) {
            return next(
                new ErrorResponse('Account has been deactivated', 403, []),
            );
        }

        // check password is correct
        const verifyPassword = await authService.matchEncryptedPassword({
            hash: password,
            user: userExist,
        });
        if (!verifyPassword) {
            // Fetch user as Mongoose document to enable .save() method
            const userDoc = await User.findById(userExist._id || userExist.id);
            if (userDoc) {
                await authService.increaseLoginLimit(userDoc);
            }
            return next(
                new ErrorResponse('Invalid email or password.', 400, []),
            );
        }

        if (!userExist.isActive) {
            return next(
                new ErrorResponse(
                    'Inactive account, kindly verify otp to activate account.',
                    206,
                    [],
                ),
            );
        }

        // Get Mongoose document for operations that need .save()
        const userDoc = await User.findById(userExist._id);
        if (!userDoc) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        // Update login information
        await authService.activateAccount(userDoc);
        await authService.updateLastLogin(userDoc);
        //await authService.updateLoginInfo(userDoc, req);

        const token = await tokenService.attachToken(userDoc);

        if (token.error) {
            return next(new ErrorResponse(token.message, token.code!, []));
        }

        const mappedUser = await authMapper.mapActivatedUser(userDoc);

        // Include comprehensive onboarding data in the response if available
        const responseData = {
            ...mappedUser,
            token: token.data.token,
        };

        res.status(200).json({
            error: false,
            errors: [],
            data: responseData,
            message: 'User logged in successfully.',
            status: 200,
        });
    },
);

/**
 * @name logoutUser
 * @description Logs out a user and invalidates the session/token
 * @route POST /api/auth/logout
 * @access Private
 */
export const logoutUser: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;

        const userDoc = await User.findById(userId);
        if (!userDoc) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        const result = await tokenService.detachToken(userDoc);
        if (result.error) {
            return next(new ErrorResponse(result.message, result.code, []));
        }

        await authService.updateLastLogin(userDoc);
        //await authService.updateLoginInfo(userDoc, req);

        return res.status(200).json({
            error: false,
            errors: [],
            data: {},
            message: 'User logged out successfully.',
            status: 200,
        });
    },
);

/**
 * @name RefreshToken
 * @description Automatically generates a new token for a user if the current token is near expiry
 * @route POST /auth/token
 * @access Private
 */
export const refreshToken: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const accessToken = req.headers.authorization?.split(' ')[1];

        if (!accessToken) {
            return next(new ErrorResponse('Unauthorized', 401, []));
        }

        const sendToken = await tokenService.refreshToken(accessToken);

        if (sendToken.error) {
            return next(
                new ErrorResponse(sendToken.message, sendToken.code, []),
            );
        }

        res.status(200).json({
            error: false,
            message: { message: sendToken.message },
            data: { token: sendToken.data.token },
        });
    },
);

/**
 * @name forgotPassword
 * @description Allows user request OTP to reset their password
 * @route POST /auth/forgot-password
 * @access  Public
 */
export const forgotPassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;

        if (!(await authService.checkEmail(email))) {
            return next(new ErrorResponse('Invalid email format.', 400, []));
        }

        const userResult = await userRepository.findOne({
            email: email.toLowerCase(),
        });
        if (userResult.error || !userResult.data) {
            return next(
                new ErrorResponse(
                    'User with this email does not exist',
                    404,
                    [],
                ),
            );
        }
        const user = userResult.data as IUserDoc;

        // Check if account is locked or deactivated}
        if (await authService.checkLockedStatus(user)) {
            return next(
                new ErrorResponse(
                    'Account is locked. Please try again later',
                    423,
                    [],
                ),
            );
        }

        if (user.isDeactivated) {
            return next(
                new ErrorResponse('Account has been deactivated', 403, []),
            );
        }

        // Fetch user as Mongoose document to enable .save() method
        const userDoc = await User.findById(user._id || user.id);
        if (!userDoc) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        const Otp = await authService.generateOTPCode(
            userDoc,
            OtpType.FORGOTPASSWORD,
        );

        if (Otp) {
            const sendOTP = await emailService.sendOTPEmail({
                user,
                code: Otp,
                otpType: OtpType.FORGOTPASSWORD,
            });

            if (sendOTP.error) {
                return next(
                    new ErrorResponse(sendOTP.message, sendOTP.code!, []),
                );
            }
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: {},
            message: 'Password reset OTP sent to your email',
            status: 200,
        });
    },
);

/**
 * @name resetPassword
 * @description Allows user change their password using the OTP
 * @route POST /auth/reset-password
 * @access  Public
 */
export const resetPassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, newPassword }: ResetPasswordDTO = req.body;

        if (!email || !newPassword) {
            return next(
                new ErrorResponse(
                    'Email, and new password are required',
                    400,
                    [],
                ),
            );
        }

        const passCheck = await authService.checkPassword(newPassword);
        if (!passCheck) {
            return next(
                new ErrorResponse(
                    'Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number',
                    400,
                    [],
                ),
            );
        }

        const userDoc = await User.findOne({ email: email.toLowerCase() });
        if (!userDoc) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        await authService.encryptUserPassword(userDoc, newPassword);
        await userDoc.save();

        const sendEmail =
            await emailService.sendPasswordResetNotificationEmail(userDoc);
        if (sendEmail.error) {
            return next(
                new ErrorResponse(sendEmail.message, sendEmail.code, []),
            );
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: {},
            message: 'Password reset successfully',
            status: 200,
        });
    },
);

/**
 * @name changePassword
 * @description Allows user to change their password using their old password
 * @route POST /auth/change-password
 * @access  Private
 */
export const changePassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;

        const { currentPassword, newPassword }: ChangePasswordDTO = req.body;
        if (!currentPassword || !newPassword) {
            return next(
                new ErrorResponse(
                    'Current and new password are required',
                    400,
                    [],
                ),
            );
        }

        // Get Mongoose document with password field
        const userDoc = await User.findById(userId).select('+password');
        if (!userDoc) {
            return next(new ErrorResponse('User not found', 404, []));
        }

        const isMatch = await authService.matchEncryptedPassword({
            hash: currentPassword,
            user: userDoc,
        });
        if (!isMatch) {
            return next(
                new ErrorResponse('Current password is incorrect', 400, []),
            );
        }

        const passCheck = await authService.checkPassword(newPassword);
        if (!passCheck) {
            return next(
                new ErrorResponse(
                    'Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number',
                    400,
                    [],
                ),
            );
        }

        await authService.encryptUserPassword(userDoc, newPassword);
        await userDoc.save();

        const sendEmail =
            await emailService.sendPasswordChangeNotificationEmail(userDoc);
        if (sendEmail.error) {
            return next(
                new ErrorResponse(sendEmail.message, sendEmail.code, []),
            );
        }

        res.status(200).json({
            error: false,
            errors: [],
            data: {},
            message: 'Password changed successfully',
            status: 200,
        });
    },
);

/**
 * @name verifyOTP
 * @description API endpoint to verify the a user OTP.
 * @route POST /auth/verify-otp
 * @access Public
 */
export const verifyOTP: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp, otpType }: VerifyOtpDTO = req.body;

        if (!email || !otp || !otpType) {
            return next(
                new ErrorResponse(
                    'Email, OTP and OTP Type are required',
                    400,
                    [],
                ),
            );
        }

        // use email to find the user
        const userResult = await userRepository.findOne({
            email: email.toLowerCase(),
        });
        if (userResult.error || !userResult.data) {
            return next(new ErrorResponse('User not found', 404, []));
        }
        const user = userResult.data as IUserDoc;

        const otpVerification = await authService.verifyOTP({
            email: user.email,
            otp,
            otpType,
        });
        if (otpVerification.error) {
            return next(
                new ErrorResponse(
                    otpVerification.message,
                    otpVerification.code!,
                    [],
                ),
            );
        }

        return res.status(200).json({
            error: false,
            message: 'OTP verified successfully',
            data: {},
            status: 200,
        });
    },
);

/**
 * @name resendOTP
 * @description API endpoint to resendOTP to a user.
 * @route POST /auth/resend-otp
 * @access Public
 */
export const resendOTP: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, otpType }: ResendOtpDTO = req.body;

        if (!email) {
            return next(new ErrorResponse('Email is required', 400, []));
        }

        if (!otpType)
            return next(new ErrorResponse('otptype is required', 400, []));

        const userResult = await userRepository.findOne({
            email: email.toLowerCase(),
        });
        if (userResult.error || !userResult.data) {
            return next(new ErrorResponse("User doesn't exist", 400, []));
        }
        const user = userResult.data as IUserDoc;

        const OTP = await authService.generateOTPCode(user, otpType);

        if (OTP) {
            const sendOTP = await emailService.sendOTPEmail({
                user,
                code: OTP,
                otpType,
            });

            if (sendOTP.error) {
                return next(
                    new ErrorResponse(sendOTP.message, sendOTP.code!, []),
                );
            }
        }

        return res.status(200).json({
            error: false,
            message: 'OTP has been sent to your email!',
            data: {},
            status: 200,
        });
    },
);
