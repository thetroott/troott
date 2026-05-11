import { EmailService, OAuthProvider } from "@/types/common.enum";
import { PaymentProviders } from "@/types/payments.enums";
import IUserDoc, { OtpType } from "./user.interface";
import { PassThrough } from "stream";
import { FileInfo } from "busboy";

/**
 * S3 upload reference stored on documents that have user-uploaded assets
 * (avatars, banners, sermon images, etc.).
 */
export interface Upload {
    /** Original or server-normalised file name. */
    fileName: string;
    /** Full S3 object key used to retrieve the file. */
    s3Key: string;
}


/**
 * Standard API response envelope.
 *
 * @typeParam T - Shape of the `data` payload (defaults to `any`).
 */
export interface IResult <T = any> {
    /** Whether the request resulted in an error. */
    error: boolean;
    /** Human-readable status message. */
    message: string;
    /** HTTP status code. */
    code: number;
    /** Response payload. */
    data: any;

  
    errors?: Array<T>;
    report?: IAPIReport;
    pagination?: IPagination;
    message: string;
    code: number;
    data: T;
    token?: string;
    status?: number;
    filters?: any;
}

/** Offset-based pagination wrapper returned by list endpoints. */
export interface IPagination {
    /** Total number of records matching the query. */
    total: number;
    /** Number of records in the current page. */
    count: number;
    /** Links to the next and previous pages. */
    pagination: {
        next: { page: number; limit: number };
        prev: { page: number; limit: number };
    };
    /** Array of records for the current page. */
    data: Array<any>;
}




export interface IAPIReport {
    format: string;
    csv?: string;
    xml?: any;
    pdf?: any;
}



/**
 * Tokenised debit/credit card stored after a successful payment authorisation.
 *
 * Used by {@link IListenerDoc} and {@link ISubscriptionDoc} to charge
 * returning customers without re-entering card details.
 */
export interface IDebitCard {
    /** Provider-issued authorisation code for recurring charges. */
    authCode: string;
    /** First 6 digits of the card number (BIN). */
    cardBin: string;
    /** Last 4 digits of the card number. */
    cardLast: string;
    /** Two-digit expiry month (01-12). */
    expiryMonth: string;
    /** Four-digit expiry year. */
    expiryYear: string;
    /** Masked PAN displayed to the user (e.g. `**** **** **** 1234`). */
    cardPan: string;
    /** Reusable card token for the payment provider. */
    token: string;
    /** Payment provider that issued the token (e.g. `paystack`). */
    provider: string;
}

/** ISO timezone metadata used within {@link IUserCountry} and {@link ICountry}. */
export interface ITimezone {
    /** Short timezone code (e.g. `WAT`). */
    code: string;
    /** IANA timezone name (e.g. `Africa/Lagos`). */
    name: string;
    /** Country subdivision the timezone applies to. */
    subdivision: string;
}

/** Administrative subdivision of a country (state / province / region). */
export interface IState {
    /** Short state code (e.g. `LA` for Lagos). */
    code: string;
    /** Full state name. */
    name: string;
    /** Subdivision type or code. */
    subdivision: string;
}

/**
 * Extended timezone shape used for display purposes.
 *
 * @remarks Declared separately from the short {@link ITimezone} form because
 * it carries UI-friendly labels and DST offsets.
 */
export interface ITimezone {
    /** IANA timezone name. */
    name: string;
    /** Short label for dropdowns. */
    label: string;
    /** Human-readable display string (e.g. `(UTC+01:00) West Africa Time`). */
    displayName: string;
    /** ISO-3166 country codes this timezone covers. */
    countries: Array<string>;
    /** Numeric UTC offset in minutes. */
    utcOffset: string;
    /** String representation of UTC offset (e.g. `+01:00`). */
    utcOffsetStr: string;
    /** Numeric DST offset in minutes. */
    dstOffset: string;
    /** String representation of DST offset. */
    dstOffsetStr: string;
    /** Canonical IANA name this timezone is an alias of, if any. */
    aliasOf: string;
}

/**
 * Lightweight country shape attached to a user profile.
 *
 * Subset of {@link ICountry} with only the fields needed for
 * user-facing display and phone/currency logic.
 */
export interface IUserCountry {
    /** Country name (e.g. `Nigeria`). */
    name: string;
    /** ISO-3166-1 alpha-2 code (e.g. `NG`). */
    code2: string;
    /** ISO-3166-1 alpha-3 code (e.g. `NGA`). */
    code3: string;
    /** Capital city. */
    capital: string;
    /** Continental region (e.g. `Africa`). */
    region: string;
    /** ISO-4217 currency code (e.g. `NGN`). */
    currencyCode: string;
    /** International dialling code (e.g. `+234`). */
    phoneCode: string;
    /** Timezones applicable to this country. */
    timezones: Array<ITimezone>;
}

/**
 * Full country reference used by the platform's country registry.
 *
 * Extends the user-facing shape with states, flags, and currency images
 * for admin dashboards and onboarding flows.
 */
export interface ICountry {
    /** Country name. */
    name: string;
    /** ISO-3166-1 alpha-2 code. */
    code2: string;
    /** ISO-3166-1 alpha-3 code. */
    code3: string;
    /** Capital city. */
    capital: string;
    /** Continental region. */
    region: string;
    /** Sub-region (e.g. `Western Africa`). */
    subregion: string;
    /** Administrative subdivisions (states / provinces). */
    states: Array<IState>;
    /** URL-safe slug. */
    slug: string;
    /** Applicable timezones. */
    timezones: Array<ITimezone>;
    /** URL to the country flag image. */
    flag: string;
    /** Base64-encoded flag for inline rendering. */
    base64: string;
    /** ISO-4217 currency code. */
    currencyCode: string;
    /** URL to the currency symbol/image. */
    currencyImage: string;
    /** International dialling code. */
    phoneCode: string;
}

/**
 * API key pair issued to a user or service account.
 *
 * Keys are environment-scoped (live / test) and can be revoked
 * or suspended independently.
 */
export interface IAPIKey {
    /** Secret key (server-side only, never exposed to clients). */
    secret: string;
    /** Publishable key (safe to embed in client apps). */
    public: string;
    /** Bearer token derived from the secret key. */
    token: string;
    /** Bearer token derived from the public key. */
    publicToken: string;
    /** Allowed origin domain for CORS validation. */
    domain: string;
    /** Whether the key pair is currently usable. */
    isActive: boolean;
    /** ISO-8601 timestamp of the last update. */
    updatedAt: string;
    /** When the key pair was created. */
    createdAt: Date;
    /** When the key pair was last used to authenticate a request. */
    lastUsed: Date;
    /** Target environment for this key pair. */
    environment: APIKeyEnvironment;
    /** Lifecycle status of the key pair. */
    status: APIKeyStatus;
}

/** Target environment for an {@link IAPIKey}. */
export enum APIKeyEnvironment {
    LIVE = 'live',
    TEST = 'test',
}

/** Lifecycle status of an {@link IAPIKey}. */
export enum APIKeyStatus {
    ACTIVE = 'active',
    REVOKED = 'revoked',
    EXPIRED = 'expired',
    SUSPENDED = 'suspended',
}

/** Top-level S3 folder used to organise uploaded assets by media type. */
export enum S3Folder {
    IMAGES = 'images',
    AUDIO = 'audio',
    VIDEOS = 'videos',
    DOCUMENTS = 'documents',
    OTHERS = 'others',
}

/** How the raw file payload is encoded in the upload request. */
export enum FileFormat {
    BASE64 = 'base64',
    RAWFILE = 'rawfile',
}

/** Broad media category of an uploaded file. */
export enum FileType {
    AUDIO = 'audio',
    DOCUMENT = 'document',
    IMAGE = 'image',
    VIDEO = 'video',
}

/** MIME types the platform accepts for uploads. */
export enum FileMimeType {
    JPEG = 'image/jpeg',
    PNG = 'image/png',
    WEBP = 'image/webp',
    SVG = 'image/svg+xml',
    PDF = 'application/pdf',
    MPEG = 'audio/mpeg',
    MP3 = 'audio/mp3',
    WAV = 'audio/wav',
    AAC = 'audio/aac',
    OGG = 'audio/ogg',
    M4A = 'audio/x-m4a',
    MP4 = 'video/mp4',
    WEBM = 'video/webm',
}

/** Connection options for a Redis instance (IORedis-compatible). */
export interface IRedisOptions {
    /** IP version preference (4 or 6). */
    family?: number;
    /** Redis server hostname. */
    host: string;
    /** Redis server port. */
    port: number;
    /** ACL username. */
    user: string;
    /** ACL password. */
    password: string;
    /** Logical database index (0-15). */
    db: number;
    /** Whether this is a managed Redis service (e.g. ElastiCache, Upstash). */
    managed: boolean;
    /** TLS options passed to the underlying socket. */
    tls: {
        rejectUnauthorized?: boolean;
        [key: string]: string | boolean | undefined;
    };
}

/** Generic key-value pair used for cache and config entries. */
export interface IData {
    key: string;
    value: any;
}


/** AWS SDK configuration for S3 operations. */
export interface AWSConfig {
    /** AWS region (e.g. `us-east-1`). */
    region: string;
    /** IAM access key ID. */
    accessKeyId: string;
    /** IAM secret access key. */
    secretAccessKey: string;
    /** Target S3 bucket name. */
    bucketName: string;
}

/** Transactional email provider configuration. */
export interface EmailConfig {
    /** Sender email address. */
    fromEmail: string;
    /** Sender display name. */
    fromName: string;
    /** Reply-to address, if different from `fromEmail`. */
    replyTo?: string;
    /** Email service driver (SendGrid, Resend, SMTP, etc.). */
    service: EmailService;
    /** API key for the chosen service. */
    apiKey?: string;
    /** SMTP server hostname (SMTP driver only). */
    smtpHost?: string;
    /** SMTP server port (SMTP driver only). */
    smtpPort?: number;
    /** SMTP authentication username. */
    smtpUser?: string;
    /** SMTP authentication password. */
    smtpPass?: string;
    /** Provider-specific template ID for transactional emails. */
    templateId?: string;
    /** When true, emails are logged but not actually sent. */
    isTestMode?: boolean;
    /** Verified sending domain (e.g. `mail.troott.com`). */
    sendingDomain?: string;
    /** Base URL of the client app (used for links in emails). */
    clientUrl?: string;
}

/** Payment provider configuration. */
export interface PaymentConfig {
    /** Payment provider identifier. */
    provider: PaymentProviders;
    /** Server-side secret key. */
    secretKey: string;
    /** Client-side publishable key. */
    publicKey: string;
    /** Webhook signature secret for payload verification. */
    webhookSecret?: string;
    /** When true, transactions hit the provider's sandbox. */
    isTestMode: boolean;
}

/** Frontend URL configuration for link generation and redirects. */
export interface FrontendURLConfig {
    /** Root URL of the web client. */
    baseUrl: string;
    /** API base URL the client connects to. */
    apiUrl?: string;
    /** URL to redirect after payment completion. */
    paymentRedirectUrl?: string;
    /** Admin dashboard URL. */
    dashboardUrl?: string;
}

/** Single OAuth provider credentials. */
export interface OAuthConfig {
    /** OAuth provider identifier. */
    provider: OAuthProvider;
    /** OAuth client ID. */
    clientId: string;
    /** OAuth client secret. */
    clientSecret: string;
    /** Callback URL registered with the provider. */
    redirectUri: string;
}

/** Map of all configured OAuth providers. */
export interface OAuthProvidersConfig {
    /** Google OAuth credentials. */
    google: OAuthConfig;
    /** GitHub OAuth credentials. */
    github: OAuthConfig;
}

/**
 * Payload pushed onto the email queue for async delivery.
 *
 * The queue worker picks this up, renders the template, and
 * dispatches via the configured {@link EmailConfig.service}.
 */
export interface IEmailJob {
    /** Recipient user. */
    user: IUserDoc;
    /** Email subject line. */
    subject: string;
    /** Template variables. */
    payload: Record<string, any>;
    /** Email service driver to use. */
    driver: EmailService;
    /** Template name override. */
    template?: string;
    /** Unique job code for idempotency. */
    code?: string;
    /** Arbitrary metadata attached to the job. */
    metadata?: any;
    /** Presentation options for the email template. */
    options?: {
        subject?: string;
        salute?: string;
        buttonUrl?: string;
        buttonText?: string;
        emailBody?: string;
        emailBodies?: Array<string>;
        bodyOne?: string;
        bodyTwo?: string;
        bodyThree?: string;
        otpType?: OtpType;
        status?: string;
    };
}

/**
 * In-flight file descriptor created during a multipart upload.
 *
 * Wraps a busboy stream with platform metadata so downstream
 * processors (S3, transcoder) know how to handle the file.
 */
export interface IFile {
    /** Readable stream of file bytes. */
    stream?: PassThrough;
    /** Secondary stream for metadata extraction (duration, dimensions). */
    metadataStream?: PassThrough;
    /** Busboy file info (encoding, MIME, filename). */
    info?: FileInfo;
    /** Resolved MIME type. */
    mimeType?: string;
    /** Sanitised file name. */
    fileName?: string;
    /** Form field name that carried the file. */
    fieldname?: string;
    /** File size in bytes (known after upload completes). */
    size?: number;
    /** Broad media category. */
    fileType?: FileType;
    /** Tracking ID for this upload. */
    uploadId?: string;
    /** User ID of the uploader. */
    uploadedBy?: string;
}

/**
 * Describes a complete file upload request including encoding format
 * and optional base64 payload.
 */
export interface IFIleUpload {
    /** The file descriptor. */
    file: IFile;
    /** How the file is encoded in the request body. */
    format: FileFormat;
    /** MIME type of the file. */
    type: FileMimeType;
    /** Optional display name. */
    name?: string;
    /** Base64-encoded file contents (when {@link format} is `BASE64`). */
    base64?: string;
}
