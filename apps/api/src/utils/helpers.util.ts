import slugify from 'slugify';
import { DateTime } from 'luxon';
import {
    FileMimeType,
    FileType,
    S3Folder,
} from '@/interfaces/common.interface';
import type { IPlanPaystackCode } from '@/interfaces/plan.interface';
import { UserType } from '@/interfaces/user.interface';
import { Random } from '@btffamily/pacitude';
import { AWS_BUCKETS_STORAGE } from '@/configs/aws.config';

/** Normalize Express route params (`string | string[]`) to a single string. */
export function resolveRouteParam(
    value: string | string[] | undefined,
): string {
    if (value == null) return '';
    if (Array.isArray(value)) return value[0] ?? '';
    return value;
}

/**
 * @name genUserCode
 * @description Generates a unique, standardized identification code for a user based on their type.
 * @param {UserType} userType - The classification of the user (e.g. listener, minister).
 * @returns {string} A formatted string in the format: {abbr}-{year}-{random_6_digits}.
 */
export const genUserCode = (userType: UserType): string => {
    const name: Record<string, string> = {
        [UserType.SUPERADMIN]: 'sa',
        [UserType.ADMIN]: 'ad',
        [UserType.MINISTER]: 'mn',
        [UserType.CREATOR]: 'cr',
        [UserType.LISTENER]: 'ls',
        [UserType.USER]: 'ppl',
    };

    const baseName = name[userType] || 'ppl';
    const now = new Date();
    const year = now.getFullYear();
    const code = Random.randomNum(6);

    return `${baseName}-${year}-${code}`;
};

/**
 * @name genSermonCode
 * @description Generates a unique sermon catalog code (`sm-{year}-{random_6_digits}`).
 */
export const genSermonCode = (): string => {
    const year = new Date().getFullYear();
    const code = Random.randomNum(6);
    return `sm-${year}-${code}`;
};

/**
 * Generates random characters
 * @param length - The length of the characters to generate.
 * @returns A randomly generated characters.
 */
export const generateRandomChars = (length: number = 20) => {
    const numberChars = '0123456789';
    const letterChars = 'abcdefghijklmnopqrstuvwxyz';
    const allChars = numberChars + letterChars;

    const shuffle = (str: string) =>
        str
            .split('')
            .sort(() => 0.5 - Math.random())
            .join('');

    const shuffledChars = shuffle(allChars);

    const randomChars = shuffledChars.slice(0, length);

    return randomChars;
};

/**
 * Generates random numbers
 * @param length - The length of the numbers to generate.
 * @returns A randomly generated numbers.
 */
export const generateRandomNumbers = (length: number = 20) => {
    const numberChars = '0123456789';
    const shuffledChars = numberChars
        .split('')
        .sort(() => 0.5 - Math.random())
        .join('');
    const randomNumbers = shuffledChars.slice(0, length);
    return randomNumbers;
};

/**
 * Generates random characters and numbers
 * @param length - The length of the characters and numbers to generate.
 * @returns A randomly generated characters and numbers.
 */
export const generateRandomCode = (length: number = 6) => {
    const numberChars = '0123456789';
    const letterChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const allChars = numberChars + letterChars;

    const shuffle = (str: string) =>
        str
            .split('')
            .sort(() => 0.5 - Math.random() * 1000000)
            .join('');

    const shuffledChars = shuffle(allChars);

    const randomChars = shuffledChars.slice(0, length);

    return randomChars;
};

/**
 * Generates a secure random password.
 * Password will contain:
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Minimum length of 8 characters (default is 12)
 *
 * @param length - Total length of the password (default: 12).
 * @returns A randomly generated secure password.
 */
export const generatePassword = (length: number = 16) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    const getRandomChar = (charset: string) =>
        charset[Math.floor(Math.random() * charset.length)];

    // Ensure password meets all requirements
    let password = [
        getRandomChar(uppercase),
        getRandomChar(lowercase),
        getRandomChar(numbers),
        getRandomChar(special),
    ];

    const allChars = uppercase + lowercase + numbers + special;
    for (let i = password.length; i < length; i++) {
        password.push(getRandomChar(allChars));
    }

    // Shuffle the password to make it more random
    return password.sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate a secure API key.
 * @param {number} expiryDays - Number of days before the key expires (null for no expiration).
 * @param {string[]} permissions - The access rights assigned to this key.
 * @returns {string} - The generated API key.
 */
export const generateApiKey = () => {};

/**
 * Helper method to determine platform type
 */
export const detectPlatform = (
    deviceType: string | undefined,
): 'web' | 'mobile' | 'tablet' => {
    if (!deviceType) return 'web';
    if (deviceType.toLowerCase() === 'tablet') return 'tablet';
    if (['mobile', 'phone'].includes(deviceType.toLowerCase())) return 'mobile';
    return 'web';
};

export const determineFileType = (mimeType: FileMimeType): FileType => {
    if (mimeType.startsWith('audio/')) return FileType.AUDIO;
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType.startsWith('video/')) return FileType.VIDEO;
    if (mimeType === 'application/pdf') return FileType.DOCUMENT;
    throw new Error(`Unsupported MIME type: ${mimeType}`);
};

export const genFileName = (
    name: string | undefined,
    fileType: FileType,
): string => {
    const baseName = name?.trim() && name.length > 0 ? name : 'troott-file';

    const now = new Date();
    const day = now.toISOString().split('T')[0] ?? 'unknown-date'; // YYYY-MM-DD
    const timeRaw = now.toTimeString().split(' ')[0] ?? '00-00-00';
    const time = timeRaw.replace(/:/g, '-'); // HH-MM-SS

    return `${baseName}-${fileType.toLowerCase()}-${day}-${time}`;
};

export const getFileExtension = (arg: any) => {
    // extract file extension
    const ext = arg.mimetype.split('/')[1];

    return ext;
};

export const checkUniqueName = async (Model: any, name: string) => {
    // check if user already exists
    const existingUser = await Model.findOne({ username: genSlug(name) });

    if (existingUser) return true;
    else return false;
};

export const genSlug = (arg: string) => {
    const val = slugify(arg, { lower: true, trim: true });
    return val;
};
export const createUniqueFileName = (arg: string, ext: string) => {
    const val = genSlug(arg);
    const fileName = `${val}-${Date.now()}.${ext}`;

    return fileName;
};

// check unique record
export const checkUniqueRecord = async (Model: any, arg: string) => {
    // check if user already exists
    const existingRec = await Model.findOne({ slug: genSlug(arg) });

    if (existingRec) return true;
    return false;
};

export const isObject = (arg: string) => {
    const ty = typeof arg;

    if (ty === 'object') return true;
    return false;
};

export const isString = (arg: string) => {
    const ty = typeof arg;

    if (ty === 'string') return true;
    return false;
};

export const isArray = (arg: string) => {
    if (Array.isArray) return Array.isArray(arg);
    return false;
};

export const strToArray = (arg: string, split: string) => {
    return arg.split(split);
};

export const strToArrayEs6 = (arg: string, split: string) => {
    return arg.split(split);
};

export const strIncludes = (arg: string, inc: string) => {
    if (arg.indexOf(inc)) return true;
    return false;
};

export const dateFromISO = (arg: any) => {
    return DateTime.fromISO(arg);
};

export const formatDate = (arg: string) => {
    return arg.split('T')[0];
};

export const formatTime = (arg: string) => {
    const timeExtract = arg.split('T')[1] ?? '';
    return timeExtract.substring(0, 5);
};

export const formatMoney = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export const getIdIndex = (data: any[], value: string) => {
    // get resource index
    const index = data.findIndex((item: any) => {
        return item.id == value;
    });

    // return index
    return index;
};

export const countTruthyValues = (arg: object) => {
    const valuesArray = Object.values(arg);
    const truthyValues = valuesArray.filter(Boolean);
    return truthyValues.length;
};

export const arrStrResolve = (arg: any) => {
    let val;

    if (isArray(arg)) val = [...arg];
    else val = [arg];

    return val;
};

interface GetS3Folder {
    (mimeType: string): S3Folder;
}

export const getS3Folder: GetS3Folder = (mimeType: string): S3Folder => {
    switch (mimeType) {
        // Images
        case 'image/jpeg':
        case 'image/png':
        case 'image/webp':
        case 'image/svg+xml':
            return S3Folder.IMAGES;

        // Audio
        case 'audio/mpeg':
        case 'audio/mp3':
        case 'audio/wav':
        case 'audio/x-wav':
        case 'audio/wave':
        case 'audio/aac':
        case 'audio/x-m4a':
        case 'audio/m4a':
        case 'audio/mp4':
        case 'audio/ogg':
        case 'audio/opus':
        case 'audio/flac':
        case 'audio/x-flac':
        case 'audio/webm':
        case 'audio/x-caf':
        case 'audio/aiff':
        case 'audio/x-aiff':
            return S3Folder.AUDIO;

        // Video
        case 'video/mp4':
        case 'video/webm':
            return S3Folder.VIDEOS;

        // Documents
        case 'application/pdf':
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        case 'text/plain':
            return S3Folder.DOCUMENTS;

        default:
            return S3Folder.OTHERS;
    }
};

const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/mp4': 'm4a',
    'audio/m4a': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/aac': 'aac',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/wave': 'wav',
    'audio/ogg': 'ogg',
    'audio/opus': 'opus',
    'audio/flac': 'flac',
    'audio/x-flac': 'flac',
    'audio/webm': 'webm',
    'audio/x-caf': 'caf',
    'audio/aiff': 'aiff',
    'audio/x-aiff': 'aiff',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        'pptx',
    'text/plain': 'txt',
};

/** File extension for S3 object keys (no leading dot). */
export const extensionFromMimeType = (mimeType: string): string => {
    const mime = mimeType.toLowerCase().split(';')[0]?.trim() ?? '';
    if (MIME_TYPE_TO_EXTENSION[mime]) {
        return MIME_TYPE_TO_EXTENSION[mime];
    }
    const subtype = mime.split('/')[1];
    if (!subtype) {
        return 'bin';
    }
    if (subtype === 'svg+xml') {
        return 'svg';
    }
    if (subtype.includes('+')) {
        return subtype.split('+')[0] ?? 'bin';
    }
    return subtype;
};

/** Extension from original filename when present and safe. */
export const extensionFromFilename = (
    filename: string | undefined | null,
): string | null => {
    const name = filename?.trim() ?? '';
    if (!name) {
        return null;
    }
    const match = name.match(/\.([a-zA-Z0-9]{1,8})$/);
    if (!match?.[1]) {
        return null;
    }
    const ext = match[1].toLowerCase();
    if (ext === 'jpeg') {
        return 'jpg';
    }
    return ext;
};

/**
 * S3 object key: `{folder}/{uploadId}.{ext}`.
 * `uploadId` stays extensionless; extension comes from filename or MIME type.
 */
export const buildS3ObjectKey = (
    folder: string,
    uploadId: string,
    mimeType: string,
    originalFilename?: string | null,
): string => {
    const id = uploadId.trim();
    const ext =
        extensionFromFilename(originalFilename) ??
        extensionFromMimeType(mimeType);
    const base = id.replace(/\.[a-zA-Z0-9]{1,8}$/, '');
    return `${folder}/${base}.${ext}`;
};

/** CDN base from CLOUDFRONT_STORAGE_URL (no trailing slash). */
export const storageCdnBase = (): string =>
    (process.env.CLOUDFRONT_STORAGE_URL || '').replace(/\/$/, '');

/** Public URL for a troott-storage S3 key, e.g. images/file-image-…. */
export const buildStoragePublicUrl = (s3Key: string): string => {
    const base = storageCdnBase();
    const key = s3Key?.trim() ?? '';
    if (!base || !key) {
        return key;
    }
    const segments = key
        .replace(/^\/+/, '')
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment));
    return `${base}/${segments.join('/')}`;
};

/** Public still-image URL for legacy bare uploadId (no extension). Prefer full s3Key on new uploads. */
export const buildStorageImageUrl = (uploadId: string): string =>
    buildStoragePublicUrl(`images/${uploadId}`);

const extractStorageS3KeyFromUrl = (url: URL): string | null => {
    const bucket = (
        AWS_BUCKETS_STORAGE ||
        process.env.AWS_STORAGE_BUCKET ||
        ''
    ).trim();
    if (!bucket) {
        return null;
    }
    const host = url.hostname;
    if (host.includes('.s3.') && host.startsWith(`${bucket}.`)) {
        const key = url.pathname.replace(/^\//, '');
        return key ? decodeURIComponent(key) : null;
    }
    if (host.includes('s3.') || host === 's3.amazonaws.com') {
        const parts = url.pathname.replace(/^\//, '').split('/');
        if (parts[0] === bucket && parts.length > 1) {
            return decodeURIComponent(parts.slice(1).join('/'));
        }
    }
    return null;
};

/** Remove cache-bust query/hash suffixes before parsing storage URLs or keys. */
export const stripUrlQueryAndHash = (value: string): string =>
    value.split('#')[0]?.split('?')[0] ?? value;

/**
 * Normalize a stored CDN URL, raw S3 URL, s3Key, or uploadId to `images/{uploadId}`.
 * Use on **write** paths (Mongo persist); map to CDN with `toStoragePublicUrl` on GET.
 */
export const normalizeStorageReferenceToS3Key = (
    stored: string | undefined | null,
): string => {
    if (stored == null) {
        return '';
    }
    const value = stripUrlQueryAndHash(stored.trim());
    if (!value) {
        return '';
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
        try {
            const url = new URL(value);
            const legacy = url.pathname.match(/^\/sermon\/image\/(.+)$/);
            if (legacy?.[1]) {
                return `images/${decodeURIComponent(legacy[1])}`;
            }
            const imagesPath = url.pathname.match(/^\/images\/(.+)$/);
            if (imagesPath?.[1]) {
                return `images/${decodeURIComponent(imagesPath[1])}`;
            }
            const key = extractStorageS3KeyFromUrl(url);
            if (key?.startsWith('images/')) {
                return key;
            }
            return value;
        } catch {
            return value;
        }
    }

    if (value.startsWith('/images/flags/')) {
        return value;
    }
    if (value.startsWith('images/')) {
        return value;
    }
    if (value.startsWith('file-image-') || /^file-[\w-]+$/.test(value)) {
        return `images/${value}`;
    }

    return value;
};

/** Map stored S3 URL, s3Key, or uploadId to CDN URL for API responses. */
export const toStoragePublicUrl = (
    stored: string | undefined | null,
): string => {
    if (stored == null) {
        return '';
    }
    const value = stripUrlQueryAndHash(stored.trim());
    if (!value) {
        return '';
    }

    const base = storageCdnBase();

    if (value.startsWith('http://') || value.startsWith('https://')) {
        try {
            const url = new URL(value);
            if (base) {
                try {
                    const cdnHost = new URL(base).hostname;
                    if (url.hostname === cdnHost) {
                        const legacy = url.pathname.match(
                            /^\/sermon\/image\/(.+)$/,
                        );
                        if (legacy?.[1]) {
                            return buildStorageImageUrl(
                                decodeURIComponent(legacy[1]),
                            );
                        }
                        return url.href;
                    }
                } catch {
                    /* invalid CLOUDFRONT_STORAGE_URL */
                }
            }
            if (url.hostname.includes('amazonaws.com')) {
                const key = extractStorageS3KeyFromUrl(url);
                if (key?.startsWith('images/')) {
                    return base ? buildStoragePublicUrl(key) : value;
                }
            }
            return value;
        } catch {
            return value;
        }
    }

    if (value.startsWith('/images/flags/')) {
        return value;
    }
    if (value.startsWith('images/')) {
        return base ? buildStoragePublicUrl(value) : value;
    }
    if (value.startsWith('file-image-') || /^file-[\w-]+$/.test(value)) {
        return base ? buildStorageImageUrl(value) : value;
    }

    return value;
};

/** Stable code for the seeded listener free tier plan. */
export const FREE_PLAN_CODE = 'plan-free-listener';

const DEFAULT_FREE_PLAN_PAYSTACK_CODES: IPlanPaystackCode = {
    nairaMonthly: 'troott_free_ngn_monthly',
    nairaYearly: 'troott_free_ngn_yearly',
    dollarMonthly: 'troott_free_usd_monthly',
    dollarYearly: 'troott_free_usd_yearly',
};

function envOrDefault(envKey: string, fallback: string): string {
    const value = process.env[envKey]?.trim();
    return value && value.length > 0 ? value : fallback;
}

/** Non-empty Paystack plan codes for $0 plans (sentinels; no Paystack API calls). */
export function getFreePlanPaystackCodes(): IPlanPaystackCode {
    return {
        nairaMonthly: envOrDefault(
            'SEED_FREE_PLAN_PAYSTACK_NGN_MONTHLY',
            DEFAULT_FREE_PLAN_PAYSTACK_CODES.nairaMonthly,
        ),
        nairaYearly: envOrDefault(
            'SEED_FREE_PLAN_PAYSTACK_NGN_YEARLY',
            DEFAULT_FREE_PLAN_PAYSTACK_CODES.nairaYearly,
        ),
        dollarMonthly: envOrDefault(
            'SEED_FREE_PLAN_PAYSTACK_USD_MONTHLY',
            DEFAULT_FREE_PLAN_PAYSTACK_CODES.dollarMonthly,
        ),
        dollarYearly: envOrDefault(
            'SEED_FREE_PLAN_PAYSTACK_USD_YEARLY',
            DEFAULT_FREE_PLAN_PAYSTACK_CODES.dollarYearly,
        ),
    };
}

/** Resolved at module load for seed, schema defaults, and service. */
export const FREE_PLAN_PAYSTACK_CODES: IPlanPaystackCode =
    getFreePlanPaystackCodes();

export function paystackCodesNeedRepair(
    codes: Partial<IPlanPaystackCode> | null | undefined,
): boolean {
    if (!codes) {
        return true;
    }
    const keys: Array<keyof IPlanPaystackCode> = [
        'nairaMonthly',
        'nairaYearly',
        'dollarMonthly',
        'dollarYearly',
    ];
    return keys.some((key) => !String(codes[key] ?? '').trim());
}


export default {
    formatMoney,
    FileType,
    FREE_PLAN_PAYSTACK_CODES,

    genUserCode,
    genSermonCode,
    generateRandomChars,
    generateRandomNumbers,
    generateRandomCode,
    generatePassword,
    generateApiKey,
    detectPlatform,
    determineFileType,
    getFileExtension,
    checkUniqueName,
    genSlug,
    createUniqueFileName,
    checkUniqueRecord,
    isObject,
    isString,
    isArray,
    strToArray,
    strToArrayEs6,
    strIncludes,
    dateFromISO,
    formatDate,
    formatTime,
    getIdIndex,
    countTruthyValues,
    arrStrResolve,

    paystackCodesNeedRepair,
    getFreePlanPaystackCodes,
};
