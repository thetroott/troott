import { Request } from 'express';
import { IResult } from '../../../utils/interfaces.util';
import {
    Random,
    arrayIncludes,
    dateToday,
    strIncludesEs6,
} from '@btffamily/pacitude';
import SystemService from '../../../services/system.service';

import {
    LoginDTO,
    MatchEncryptedPasswordDTO,
    RegisterUserDTO,
    VerifyOtpDTO,
} from './auth.dto';
import User from '../../users/user/user.model';
import userRepository from '../../users/user/user.repository';
import ErrorResponse from '../../../utils/error.util';
import {
    IUserDoc,
    LoginMethod,
    OtpType,
    UserType,
} from '../../users/user/user.interface';

class AuthService {
    public result: IResult;

    constructor() {
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    /**
     * @name validateRegister
     * @description
     * Validates the user registration payload before proceeding with user creation.
     * This method ensures all required fields are present and conform to expected rules.
     * @param {RegisterUserDTO} data - The user registration data transfer object containing the form input.
     * @returns {Promise<IResult>} A result object indicating success or failure with an appropriate message.
     */

    public async validateRegister(data: RegisterUserDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
       

        if (!data.email) {
            result.error = true;
            result.message = 'Email is required';
            result.code = 400;
        } else if (!data.password) {
            result.error = true;
            result.message = 'Password is required';
            result.code = 400;
        } else {
            result.error = false;
            result.message = '';
        }

        return result;
    }

    /**
     * @name validateLogin
     * @param data
     * @returns
     */
    public async validateLogin(data: LoginDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const { email, password } = data;

        if (!email) {
            result.error = true;
            result.message = 'email is required';
            result.code = 400;
        } else if (!password) {
            result.error = true;
            result.message = 'password is required';
            result.code = 400;
        } else {
            const mailCheck = await this.checkEmail(email);

            if (!mailCheck) {
                result.error = true;
                result.message = `a valid email is required`;
            } else {
                result.error = false;
                result.message = ``;
            }
        }

        return result;
    }

    /**
     * @name validatePhoneNumber
     * @param data
     * @returns
     */
    public validatePhoneNumber(data: { phone: string }): boolean {
        let result: boolean = false;
        const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        const { phone } = data;

        const split = phone.substring(0, 3).split('');

        if (
            split[0] === '0' &&
            split[1] &&
            split[2] &&
            arrayIncludes(digits, split[1]) &&
            arrayIncludes(digits, split[2])
        ) {
            result = true;
        }

        return result;
    }

    /**
     * @name checkEmail
     * @description validates against invalid email
     * @param email - The email to check with .africa bypassed
     *
     * @returns {boolean} true/false to determine the state of the email
     */
    public async checkEmail(email: string): Promise<boolean> {
        const match = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let matched: boolean = match.test(email);

        // bypass .africa domain
        if (strIncludesEs6(email, '.africa')) {
            matched = true;
        } else {
            matched = matched;
        }

        return matched;
    }

    /**
     * @name checkPassword
     * @description validates against invalid password
     * password must contain at least 8 characters,
     * 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number
     * @param password
     *
     * @returns {boolean} true/false to determine the state of the password
     */
    public async checkPassword(password: string): Promise<boolean> {
        const match =
            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/;
        const matched: boolean = match.test(password);

        return matched;
    }

    /**
     * @name validatUserType
     * @param type
     * @returns
     */
    public async validatUserType(type: string): Promise<boolean> {
        let flag = false;

        const list = [
            UserType.USER,
            UserType.ADMIN,
            UserType.BUSINESS,
            UserType.TALENT,
        ];

        if (arrayIncludes(list, type)) {
            flag = true;
        } else {
            flag = false;
        }

        return flag;
    }

    /**
     * @name attachPhoneCode
     * @param code
     * @param phone
     * @returns
     */
    public attachPhoneCode(code: string, phone: string): string {
        let result: string = '';
        let codeStr: string = '';

        if (code && phone) {
            if (strIncludesEs6(code, '-')) {
                codeStr = code.substring(3);
                codeStr = `+${codeStr}`;
            } else if (strIncludesEs6(code, '+')) {
                codeStr = code;
            } else {
                codeStr = code;
            }

            result = codeStr + phone.substring(1);
        }

        return result;
    }

    /**
     * @name checkPhoneCode
     * @param code
     * @param phone
     * @returns
     */
    public checkPhoneCode(code: string, phone: string): string {
        let result: string = '';
        let phoneStr: string = '';

        if (code && phone) {
            if (!strIncludesEs6(phone, '+') && phone.length > 10) {
                phoneStr = phone.substring(3);
                result = `${code}${phoneStr}`;
            } else if (strIncludesEs6(phone, '+')) {
                result = phone;
            }
        }

        return result;
    }

    /**
     * @name phoneExists
     * @param phone
     * @returns
     */
    public async phoneExists(phone: string): Promise<boolean> {
        let result: boolean = false;

        const exist = await User.findOne({
            $or: [{ phoneNumber: phone }, { altPhone: phone }],
        });

        if (exist) {
            result = true;
        }

        return result;
    }

    /**
     * @name updateUserType
     * @param user
     * @param userType
     */
    public async updateUserType(
        user: IUserDoc,
        userType: UserType,
    ): Promise<void> {
        user.isAdmin = false;
        user.isBusiness = false;
        user.isTalent = false;

        if (userType === UserType.ADMIN) {
            user.isAdmin = true;
        } else if (userType === UserType.BUSINESS) {
            user.isBusiness = true;
        } else if (userType === UserType.TALENT) {
            user.isTalent = true;
        }

        user.userType = userType;

        await user.save();
    }

    /**
     * @name updateLastLogin
     * @description updates the last time user logged into the system
     * @param user
     */
    public async updateLastLogin(user: IUserDoc): Promise<void> {
        const today = dateToday(new Date());
        user.login.last = today.ISO;
        user.login.method = LoginMethod.EMAIL;

        await user.save();
    }

    /**
     * @name activateAccount
     * @param user
     */
    public async activateAccount(user: IUserDoc): Promise<void> {
        user.isActivated = true;
        user.isActive = true;
        user.isLocked = false;
        user.loginLimit = 0;
        await user.save();
    }

    /**
     * @name deactivateAccount
     * @param user
     */
    public async deactivateAccount(user: IUserDoc): Promise<void> {
        user.isActive = false;
        user.isActivated = false;
        user.isLocked = true;
        user.isDeactivated = true;
        await user.save();
    }

    /**
     * @name suspendAccount
     * @param user
     */
    public async suspendAccount(user: IUserDoc): Promise<void> {
        user.isActive = false;
        user.isActivated = false;
        user.isLocked = true;
        user.isSuspended = true;
        await user.save();
    }

    /**
     * @name resetLoginLimit
     * @param user
     */
    public async resetLoginLimit(user: IUserDoc): Promise<void> {
        user.loginLimit = 0;
        await user.save();
    }

    /**
     * @name checkLockedStatus
     * @param user
     * @returns
     */
    public async checkLockedStatus(user: IUserDoc): Promise<boolean> {
        if (!user.isLocked || !user.lockedUntil) {
            return false;
        }

        const now = new Date();
        if (user.lockedUntil && user.lockedUntil > now) {
            return true;
        }

        return false;
    }

    /**
     * Increases login attempt counter and locks account if limit exceeded
     * @param user - User document
     * @returns number - Current login attempt count
     */
    public async increaseLoginLimit(user: IUserDoc): Promise<number> {
        // Increment login attempt counter
        user.loginLimit = (user.loginLimit || 0) + 1;

        // If attempts exceed 5, lock the account for 30 minutes
        if (user.loginLimit >= 5) {
            user.isLocked = true;
            user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
        }

        await user.save();
        return user.loginLimit;
    }

    /**
     * @name generateOTPCode
     * @param user User (plain object or doc) with at least _id
     * @returns OTP code string
     */
    public async generateOTPCode(
        user: IUserDoc,
        type: OtpType,
    ): Promise<string> {
        const userDoc = await User.findById(user._id ?? user.id);
        if (!userDoc) {
            throw new Error('User not found');
        }
        const gencode = Random.randomNum(6);
        userDoc.Otp = gencode.toString();
        userDoc.OtpExpiry = Date.now() + 15 * 60 * 1000;
        userDoc.otpType = type;
        await userDoc.save();

        return gencode.toString();
    }

    /**
     * @name verifyOTPCode
     * @param user
     * @param code
     * @returns
     */
    public async verifyOTPCode(code: string): Promise<IUserDoc | null> {
        const today = Date.now(); // get timestamp from today's date
        const _foundUser = await User.findOne({
            Otp: code.toString(),
            OtpExpiry: { $gt: today },
        });

        return _foundUser ? _foundUser : null;
    }

    /**
     * @name verifyOTP
     * @param user
     * @param code
     * @returns
     */
    public async verifyOTP(data: VerifyOtpDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const { email, otp: code, otpType } = data;
        const today = Date.now();

        const user = await User.findOne({
            email: email,
            Otp: code.toString(),
            otpType: otpType,
        });

        if (!user) {
            result.error = true;
            result.message = 'Invalid OTP code';
            result.code = 400;
            return result;
        }

        if (user.OtpExpiry && user.OtpExpiry < today) {
            // Clear expired OTP
            user.Otp = '';
            user.OtpExpiry = 0;
            await user.save();

            result.error = true;
            result.message = 'OTP has expired. Please request a new one';
            result.code = 400;
            return result;
        }

        // Valid OTP
        result.data = user;
        result.message = 'OTP verified successfully';

        // Clear used OTP
        user.Otp = '';
        user.OtpExpiry = 0;
        await user.save();

        return result;
    }

    /**
     * @name encryptUserPassword
     * @param user
     * @param password
     * @returns
     */
    public async encryptUserPassword(
        user: IUserDoc,
        password: string,
    ): Promise<boolean> {
        let result: boolean = false;

        const encrypted = await SystemService.encryptData({
            payload: password,
            password: user.email,
            separator: '-',
        });

        if (encrypted) {
            user.password = encrypted;

            result = true;
        }
        return result;
    }

    /**
     * @name decryptUserPassword
     * @param user
     * @returns
     */
    public async decryptUserPassword(user: IUserDoc): Promise<string | null> {
        let result: string | null = null;

        const decrypted = await SystemService.decryptData({
            password: user.email,
            payload: user.password,
            separator: '-',
        });

        result = decrypted.data.toString();

        return result;
    }

    /**
     * @name matchEncryptedPassword
     * @param data - MatchEncryptedPasswordDTO
     * @returns
     */
    public async matchEncryptedPassword(
        data: MatchEncryptedPasswordDTO,
    ): Promise<boolean> {
        let result: boolean = false;

        const { hash, user } = data;

        const hashDecrypt = await SystemService.encryptData({
            password: user.email,
            payload: hash,
            separator: '-',
        });

        if (user.password === hashDecrypt) {
            result = true;
        }

        return result;
    }

    /**
     * @name getLoggedInUser
     * @param data
     * @returns
     */
    public async getLoggedInUser(data: {
        req: Request;
        isAdmin: boolean;
    }): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const { req, isAdmin } = data;

        const user = await userRepository.findById((req as any).user._id, true);

        if (!user) {
            result.error = true;
            result.message = `authorized  - user details not found`;
            result.code = 401;
        } else if (
            user &&
            isAdmin === false &&
            ((user as any).userType === UserType.ADMIN ||
                (user as any).userType === UserType.SUPERADMIN)
        ) {
            result.error = true;
            result.message = `user is not authorized to access this route`;
            result.code = 401;
        } else {
            result.error = false;
            result.data = {
                user: user,
            };
        }

        return result;
    }

}

export default new AuthService();
