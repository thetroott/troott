import { rateLimit } from 'express-rate-limit';

/** Stricter limit for unauthenticated public teaser endpoints. */
export const openSermonTeaserLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    legacyHeaders: true,
    standardHeaders: 'draft-7',
    message: 'Too many teaser requests; try again shortly',
    statusCode: 429,
});
