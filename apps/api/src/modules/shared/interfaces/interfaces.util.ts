import { Model, Document, Types } from 'mongoose';

/** Use `Types.ObjectId` so `extends Document` and explicit `_id`/`id` stay compatible. */
type ObjectId = Types.ObjectId;
import {
    AccountManagerRole,
    APIKeyEnvironment,
    APIKeyStatus,
    APIKeyType,
    ContentState,
    ContentStatus,
    EmailType,
    OtpType,
    PasswordType,
    PlaylistType,
    AdminPermissions,
    AdminRole,
    StaffUnit,
    TransactionsType,
    UploadStatus,
    UserType,
    VerificationStatus,
    FileType,
    EmailService,
    PaymentProviders,
    OAuthProvider,
    FileFormat,
    FileMimeType,
    ProcessingState,
    UploadStepType,
} from '../../../utils/enums.util';
import { IUploadMetadata } from '../../../utils/types.util';
import { PassThrough } from 'stream';
import { FileInfo } from 'busboy';
import { ConnectionOptions, TlsOptions } from 'tls';
import type { Nullable } from './nullable';
import type { IDebitCard } from './card.interface';
import type { IUserDoc } from '../../users/user/user.interface';

export type { Nullable } from './nullable';
export type { IUserDoc } from '../../users/user/user.interface';

export type { IRoleDoc } from '../../authentication/role/role.interface';
export type { IPermissionDoc } from '../../authentication/permission/permission.interface';
export type {
    IAudioMetadata,
    IImageMetadata,
    IDocumentMetadata,
    IVideoMetadata,
    ISermonPlayCount,
    ISermonShareCount,
    ISermonLike,
    IBiteViewHistory,
    IBiteLike,
    IBiteShareHistory,
    IBiteSavedHistory,
    IBiteEngagementStats,
    ISermonDoc,
    ISermonBiteDoc,
} from '../../core/sermon/sermon.interface';
export type { IListenerDoc } from '../../users/listener/listener.interface';
export type { IMinisterDoc } from '../../users/minister/minister.interface';
export type { ICreatorDoc } from '../../users/creator/creator.interface';
export type {
    ISeries,
    ISeriesDoc,
} from '../../core/series/series.interface';
export type { ILibraryDoc } from '../../core/library/library.interface';
export type { IPlaylistDoc } from '../../core/playlist/playlist.interface';
export type { IDebitCard } from './card.interface';

export interface ITransactionDoc extends Document {
    type: TransactionsType;
    medium: string;
    resource: string;
    entity: string;
    reference: string;
    currency: string;
    providerRef: string;
    providerName: string;
    description: string;
    narration: string;
    amount: number;
    unitAmount: number; // kobo unit * 100
    fee: number;
    unitFee: number; // kobo unit * 100
    status: string;
    reason: string;
    message: string;
    providerData: Array<Record<string, any>>;
    metadata: Array<Record<string, any>>;
    channel: string;
    slug: string;
    card: IDebitCard;

    // relationships
    user: ObjectId | any;

    // timestamps
    createdAt: string;
    updatedAt: string;
    _versions: number;
    _id: ObjectId;
    id: ObjectId;

    // functions
    getAll(): Array<ITransactionDoc>;
}

export interface ISubscriptionDoc extends Document {
    code: string;
    isPaid: boolean;
    status: string;
    slug: string;
    billing: IBillingInfo;
    metadata: {
        lastBillingDate: Date;
        nextBillingDate: Date;
        billingCycle: string;
        autoRenew: boolean;
        cancelledAt?: Date;
        cancelReason?: string;
        upgradedFrom?: string;
        downgradedFrom?: string;
        promotionCode?: string;
        promotionExpiry?: Date;
    };

    // relationships
    user: ObjectId | any;
    transactions: Array<ObjectId | any>;
    plan: ObjectId | any;

    // timestamps
    createdAt: string;
    updatedAt: string;
    _versions: number;
    _id: ObjectId;
    id: ObjectId;
}

export interface IPlanDoc extends Document {
    name: string;
    isEnabled: boolean;
    description: string;
    label: string;
    currency: string;
    code: string;
    slug: string;

    pricing: IPlanPricing;
    trial: IPlanTrial;
    sermon: IPlanSermon;
    sermonBite: IPlanSermonBite;

    //relationships
    user: ObjectId | any;

    //timestamps
    createdAt: string;
    updatedAt: string;
    _versions: number;
    _id: ObjectId;
    id: ObjectId;
}
export interface IAPIKeyDoc extends Document {
    keyHash: string;
    environment: APIKeyEnvironment;
    type: APIKeyType;
    status: APIKeyStatus;
    permissions: Array<string>;
    expiresAt: string;
    revokedAt?: string;
    revokedBy?: string;
    description?: string;

    // relationships
    admin: ObjectId | any;

    // timestamps
    createdAt: string;
    updatedAt: string;
    _id: ObjectId;
    id: ObjectId;
}

export interface IDeviceToken {
    token: string;
    platform: 'ios' | 'android' | 'web';
    lastUsed: Date;
}
export interface ILoginType {
    ip: string;
    deviceType: string;
    platform: 'web' | 'mobile' | 'tablet';
    deviceInfo: {
        manufacturer?: string; // For mobile devices
        model?: string; // For mobile devices
        osName: string; // iOS, Android, Windows, macOS, etc.
        osVersion: string;
        browser?: string; // For web access
        browserVersion?: string;
        appVersion?: string; // For mobile app
    };
    location?: {
        country: string;
        city: string;
        timezone: string;
    };
}

export interface ILocationInfo {
    address: string;
    city: string;
    state: string;
}

export interface IBillingInfo {
    amount: number;
    startDate: Date;
    paidDate: Date;
    dueDate: Date;
    graceDate: Date;
    frequency: string;
}
export interface IPlanPricing {
    monthly: number;
    yearly: number;
    perMonth: number;
}

export interface IPlanTrial {
    isActive: boolean;
    startDate: Date;
    endDate: Date;
    days: number;
}

export interface IPaymentMethod {
    email: string;
    type: string;
    card?: IDebitCard;
}
export interface IPlanSermon {
    limit: {
        value: number;
        frequency: string;
    };
}

export interface IPlanSermonBite {
    limit: {
        value: number;
        frequency: string;
    };
}
export interface IRedisOptions {
    family?: number;
    host: string;
    port: number;
    user: string;
    password: string;
    db: number;
    managed: boolean;
    tls: {
        rejectUnauthorized?: boolean;
        [key: string]: string | boolean | undefined;
    };
}

export interface IData {
    key: string;
    value: any;
}

export interface IResult<T = any> {
    error: boolean;
    message: string;
    code: number;
    data: any;
}

export interface IBulkUser {
    _id: ObjectId | null | string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    phoneCode: string;
    userType: string;
}

export interface ILogin {
    email: string;
    password: string;
    code: string;
}

export interface ISearchQuery {
    model: Model<any>;
    ref: Nullable<string> | undefined;
    value: Nullable<any> | undefined;
    data: any;
    query: any;
    queryParam: any;
    populate: Array<any>;
    operator: Nullable<string>;
    fields?: Array<string>;

    // timestamps
    createdAt: string;
    updatedAt: string;
    _id: ObjectId;
    id: ObjectId;
}
export interface IPagination {
    total: number;
    count: number;
    pagination: {
        next: { page: number; limit: number };
        prev: { page: number; limit: number };
    };
    data: Array<any>;
}

export interface IAPIKeyUsage {
    keyHash: string;
    timestamp: Date;
    endpoint: string;
    ipAddress: string;
    userAgent: string;
    responseCode: number;
}

export interface IEmailRequest {
    recipient: string;
    subject: string;
    content: any;
    type: EmailType;
    template?: string;
    attachments?: any[];
}

export interface IEmailPreferences {
    marketing: boolean;
    productUpdates: boolean;
    featureAnnouncements: boolean;
    subscriptionStatus: string;
}

export interface ISensitiveData {
    card?: IDebitCard;
    providerRef: string;
    providerData: Array<Record<string, any>>;
}

export interface ICustomResponse<T> extends Response {
    customResults?: {
        success: boolean;
        count: number;
        total: number;
        pagination: {
            next?: { page: number; limit: number };
            prev?: { page: number; limit: number };
        };
        data: T[];
    };
    status: any;
}

export interface ICursorResponse<T> extends Response {
    customResults: {
        success: boolean;
        count: number;
        nextCursor: string | null;
        data: T[];
    };
}

export interface IcreatedAt {
    createdAt: Date;
}

export interface IQueryOptions {
    limit?: number;
    skip?: number;
    sort?: string;
    populate?: string;
    recentOnly?: boolean;
}

export interface AWSConfig {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
}

export interface EmailConfig {
    fromEmail: string;
    fromName: string;
    replyTo?: string;
    service: EmailService;
    apiKey?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    templateId?: string;
    isTestMode?: boolean;
    sendingDomain?: string;
    clientUrl?: string;
}

export interface PaymentConfig {
    provider: PaymentProviders;
    secretKey: string;
    publicKey: string;
    webhookSecret?: string;
    isTestMode: boolean;
}

export interface FrontendURLConfig {
    baseUrl: string;
    apiUrl?: string;
    paymentRedirectUrl?: string;
    dashboardUrl?: string;
}

export interface OAuthConfig {
    provider: OAuthProvider;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

export interface OAuthProvidersConfig {
    google: OAuthConfig;
    github: OAuthConfig;
}

export interface IEmailJob {
    user: IUserDoc;
    subject: string;
    payload: Record<string, any>;
    driver: EmailService;
    template?: string;
    code?: string;
    metadata?: any;
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

export interface IFile {
    stream?: PassThrough;
    metadataStream?: PassThrough;
    info?: FileInfo;
    mimeType?: string;
    fileName?: string;
    fieldname?: string;
    size?: number;
    fileType?: FileType;
    uploadId?: string;
    uploadedBy?: string;
}

export interface IFIleUpload {
    file: IFile;
    format: FileFormat;
    type: FileMimeType;
    name?: string;
    base64?: string;
}
