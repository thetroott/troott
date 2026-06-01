import jwt from 'jsonwebtoken';
import { IResult } from '@/interfaces/common.interface';
import ErrorResponse from '../utils/error.util';
import User from '@/models/user.model';
import dotenv from 'dotenv';
import { IUserDoc } from '@/interfaces/user.interface';

dotenv.config();

/** Reissue when remaining JWT lifetime is within this window (feat-0004). */
export const REISSUE_WINDOW_MS = 5 * 60 * 60 * 1000;

class TokenService {
    private secret: string;
    private expire: string;

    constructor() {
        this.secret = process.env.JWT_SECRET as string;
        this.expire = process.env.JWT_EXPIRY as string;

        if (!this.secret) {
            throw new ErrorResponse('JWT secrets are not defined.', 500, []);
        }
        if (!this.expire) {
            throw new ErrorResponse('JWT_EXPIRY is not defined.', 500, []);
        }
    }

    private signToken(user: IUserDoc): string {
        return jwt.sign(
            {
                id: user._id,
                email: user.email,
                role:
                    user.roles && user.roles.length > 0
                        ? typeof user.roles[0] === 'string'
                            ? user.roles[0]
                            : user.roles[0].name
                        : 'user',
                tokenVersion: user.tokenVersion,
            },
            this.secret,
            {
                algorithm: 'HS512',
                expiresIn: this.expire,
            } as jwt.SignOptions,
        );
    }

    private async persistAccessToken(
        userId: string,
        token: string,
    ): Promise<void> {
        const decoded = jwt.decode(token) as jwt.JwtPayload | null;
        await User.findByIdAndUpdate(userId, {
            accessToken: token,
            accessTokenExpiry: decoded?.exp
                ? new Date(decoded.exp * 1000)
                : undefined,
        });
    }

    /** True when JWT should be silently reissued (within 5h of exp). */
    public shouldReissueToken(token: string): boolean {
        const decoded = jwt.decode(token) as jwt.JwtPayload | null;
        if (!decoded?.exp) {
            return false;
        }
        const msUntilExp = decoded.exp * 1000 - Date.now();
        return msUntilExp > 0 && msUntilExp <= REISSUE_WINDOW_MS;
    }

    /** @deprecated Use {@link shouldReissueToken}. */
    public checkTokenValidity(token: string): boolean {
        return this.shouldReissueToken(token);
    }

    /**
     * @description Generates and attaches a JWT token to a user
     * @param {IUserDoc} user - The user document to generate token for
     * @returns {Promise<IResult>} Result object containing the generated token or error
     */
    public async attachToken(user: IUserDoc): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const token = this.signToken(user);
            await this.persistAccessToken(String(user.id), token);

            result.data = { token };
            result.message = 'Token generated successfully';
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = `Failed to generate token: ${error.message}`;
        }

        return result;
    }

    /**
     * @description Refreshes an existing JWT token if needed
     * @param {string} accessToken - The current access token to refresh
     * @returns {Promise<IResult>} Result object containing either a new token or the current valid token
     * @throws {ErrorResponse} If token is invalid or user not found
     */
    public async refreshToken(accessToken: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const decoded = jwt.verify(
                accessToken,
                this.secret,
            ) as jwt.JwtPayload;

            const user = await User.findById(decoded.id);
            if (!user || user.accessToken !== accessToken) {
                throw new ErrorResponse('Please provide a token', 401, []);
            }

            if (this.shouldReissueToken(accessToken)) {
                const newToken = this.signToken(user);
                await this.persistAccessToken(String(user._id), newToken);

                result.data = { token: newToken };
                result.message = 'Token refreshed successfully';
            } else {
                result.data = { token: accessToken };
                result.message = 'Token is still valid, no refresh needed';
            }
        } catch (error: any) {
            result.error = true;
            result.code = 401;
            result.message = `Failed to refresh token: ${error.message}`;
        }

        return result;
    }

    /**
     * @description Invalidates all sessions by bumping tokenVersion and clearing access token
     * @param {IUserDoc} user - The user document
     */
    public async bumpTokenVersion(user: IUserDoc): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            await User.findByIdAndUpdate(user.id, {
                $inc: { tokenVersion: 1 },
                accessToken: '',
                accessTokenExpiry: null,
            });
            result.message = 'Token version bumped successfully';
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = `Failed to bump token version: ${error.message}`;
        }

        return result;
    }

    /**
     * @description Removes the access token from a user's record during logout
     * @param {IUserDoc} user - The user document to detach token from
     * @returns {Promise<IResult>} Result object indicating success or failure
     */
    public async detachToken(user: IUserDoc): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            await User.findByIdAndUpdate(user.id, {
                accessToken: '',
                accessTokenExpiry: null,
            });
            result.message = 'Token detached successfully';
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = `Failed to detach token: ${error.message}`;
        }

        return result;
    }
}

export default new TokenService();
