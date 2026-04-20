import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from './async.mdw';
import User from '../modules/users/user/user.model';

/**
 * If `Authorization: Bearer <jwt>` is present and valid, sets `req.user` like `Protect`.
 * Missing or invalid token does not error (anonymous request). Used for routes that are
 * public for catalog content but may return more when the minister owner is signed in.
 */
const optionalAuth = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('authorization')?.split(' ')[1];
        if (!token) {
            return next();
        }

        let decoded: jwt.JwtPayload;
        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET!,
            ) as jwt.JwtPayload;
        } catch {
            return next();
        }

        const user = await User.findById(decoded.id);
        if (!user || user.tokenVersion !== decoded.tokenVersion) {
            return next();
        }

        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        next();
    },
);

export default optionalAuth;
