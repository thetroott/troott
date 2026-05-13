import { rateLimit } from 'express-rate-limit';

export const limitRequests = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 1000,
    legacyHeaders: true,
    standardHeaders: 'draft-7',
    message:
        'you have exceeeded the number of requests. try again in 30 minutes',
    statusCode: 429,
});

export const streamingTokenLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 20, // strict limit for expensive CDN signing
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many streaming requests. Try again shortly.',
    statusCode: 429,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20, // prevent brute force
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many login attempts. Please try again later.',
    statusCode: 429,
});
