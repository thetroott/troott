/**
 * Shared field shapes aligned with `apps/api` `common.interface` /
 * `minister.interface` (web-safe: no Mongoose refs).
 */

/** S3 upload reference returned on user / sermon assets. */
export interface Upload {
    fileName: string;
    s3Key: string;
    /** Display URL from `ImageDTO.file` — not sent on PUT. */
    url?: string;
}

/** Structured physical address — user profile (`apps/api` user.interface). */
export interface ILocation {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}
