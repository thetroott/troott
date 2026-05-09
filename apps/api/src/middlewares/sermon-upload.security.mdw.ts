import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/error.util';
import { mediaConfig } from '../configs/media.config';

/** Stricter cap for sermon audio field size vs generic multipart (aligned with media.config). */
export const sermonAudioUploadSizeLimit = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const cl = req.headers['content-length'];
    if (!cl) return next();
    const n = parseInt(cl, 10);
    if (!Number.isFinite(n) || n <= 0) return next();
    if (n > mediaConfig.sermonAudioMaxBytes) {
        return next(
            new ErrorResponse(
                `Audio file exceeds maximum size (${mediaConfig.sermonAudioMaxBytes} bytes)`,
                413,
                [],
            ),
        );
    }
    next();
};

/** Per-user upload attempts for sermon audio (authenticated routes only). */
export const sermonUploadRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: Number(process.env.SERMON_UPLOAD_RATE_LIMIT_PER_HOUR) || 40,
    standardHeaders: 'draft-7',
    legacyHeaders: true,
    keyGenerator: (req: Request) =>
        String((req as unknown as { user?: { id?: string } }).user?.id ?? req.ip),
    message: 'Too many sermon uploads this hour. Try again later.',
    statusCode: 429,
});


//