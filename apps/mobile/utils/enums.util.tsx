/** TanStack Query keys (canonical definitions in constants). */
export { QueryKeys } from '@/constants/keys';

// ---------------------------------------------------------------------------
// Client / UI (mobile)
// ---------------------------------------------------------------------------

export enum EAppChannel {
    WEB = 'web',
    MOBILE = 'mobile',
    DESKTOP = 'desktop',
    TABLET = 'tablet',
    WATCH = 'watch',
}

export enum ImageResizeMode {
    CONTAIN = 'contain',
    COVER = 'cover',
    STRETCH = 'stretch',
    CENTER = 'center',
}

export enum ENVType {
    PRODUCTION = 'production',
    STAGING = 'staging',
    DEVELOPMENT = 'development',
}

export enum AppChannel {
    WEB = 'web',
    MOBILE = 'mobile',
    DESKTOP = 'desktop',
    TABLET = 'tablet',
    WATCH = 'watch',
}

export enum HeaderType {
    IDEMPOTENT = 'x-idempotent-key',
}

export enum CookieKeyType {
    XHIT = 'x-hit',
}

export enum PasswordType {
    USERGENERATED = 'user-generated',
    SYSTEMGENERATED = 'system-generated',
    TEMPORARY = 'temporary',
    RESET = 'reset',
}

export enum FileLinks {
    TOPIC_CSV = 'https://docs.google.com/spreadsheets/d/1kJxsETglcWDsRSlHyO7MQEcJHBn9tHiUWnNKW4p1myQ/edit?usp=sharing',
}

export const UserEnum = {
    SUPER: 'superadmin',
    ADMIN: 'admin',
    BUSINESS: 'business',
    TALENT: 'talent',
    USER: 'user',
} as const;

export const LevelEnum = {
    DEFAULT: 'default',
    NOVICE: 'novice',
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    PROFESSIONAL: 'professional',
    LEADER: 'leader',
    EXPERT: 'expert',
} as const;

export enum TimeHandleEnum {
    SECONDS = 'second',
    MINUTE = 'minute',
    HOUR = 'hour',
}

export const DifficultyEnum = {
    RANDOM: 'random',
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard',
    DIFFICULT: 'difficult',
} as const;

export enum QuestionTypeEnum {
    TRIVIAL = 'trivial',
    PRACTICAL = 'practical',
    GENERAL = 'general',
}

export enum coreTypeEnum {
    CAREER = 'career',
    FIELD = 'field',
    SKILL = 'skill',
    TOPIC = 'topic',
    INDUSTRY = 'industry',
}

export const StatusEnum = {
    PENDING: 'pending',
    INPROGRESS: 'in-progress',
    OVERDUE: 'overdue',
    PROCESSING: 'processing',
    ONGOING: 'ongoing',
    SUCCESSFUL: 'successful',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    PAID: 'paid',
    CANCELLED: 'cancelled',
    SUBMITTED: 'submitted',
    REVIEWED: 'reviewed',
    ABANDONED: 'abandoned',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    DEFAULTED: 'defaulted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    DRAFT: 'draft',
    REVOKED: 'revoked',
    SUMMARIZED: 'summarized',
    QUEUED: 'queued',
    RUNNING: 'running',
    GENERATING: 'generating',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
} as const;

export const ActionEnum = {
    GENERATE: 'generate',
    CREATE: 'create',
    DELETE: 'delete',
    UPDATE: 'update',
    ENABLE: 'enable',
    DISABLE: 'disable',
    ATTACH: 'attach',
    DETACH: 'detach',
    ADD: 'add',
    REMOVE: 'remove',
} as const;

export const TaskTypeEnum = {
    TEMPLATE: 'template',
    ASSIGNED: 'assigned',
} as const;

export const TaskFieldEnum = {
    OBJECTIVES: 'objectives',
    INSTRUCTIONS: 'instructions',
    DELIVERABLES: 'deliverables',
    RESOURCES: 'resources',
    OUTCOMES: 'outcomes',
    REQUIREMENTS: 'requirements',
    RUBRICS: 'rubrics',
    SKILLS: 'skills',
    GUIDELINES: 'guidelines',
} as const;

export const UIEnum = {
    NEW: 'new',
    OLD: 'old',
    FORM: 'form',
    MESSAGE: 'message',
    BROWSE: 'browse-file',
    FILE_SELECTED: 'file-selected',
    UPLOADED: 'uploaded',
    UPLOAD_ERROR: 'upload-error',
    VIEW_MODULE: 'view-module',
    VIEW_LESSON: 'view-lesson',
    VIEW_LIBRARY: 'view-library',
} as const;

export const EditTaskEnum = {
    DETAILS: 'details',
    ...TaskFieldEnum,
} as const;

export const UploadFormatEnum = {
    BASE64: 'base64',
    RAW_FILE: 'rawfile',
} as const;

export const DurationEnum = {
    DAY: 'day',
    DAYS: 'days',
    WEEK: 'week',
    WEEKS: 'weeks',
} as const;

export enum QueuingType {
    PlayingNext = 'PLAYING_NEXT',
    DirectlyQueued = 'DIRECTLY_QUEUED',
    FromSelection = 'FROM_SELECTION',
}

export enum StreamingQuality {
    Original = 'original',
    High = 'high',
    Medium = 'medium',
    Low = 'low',
}

export enum EPasswordType {
    USERGENERATED = 'user-generated',
    SYSTEMGENERATED = 'system-generated',
    TEMPORARY = 'temporary',
    RESET = 'reset',
}

export enum EVerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    UNDER_REVIEW = 'under-review',
    NEEDS_REVISION = 'needs-revision',
    SUSPENDED = 'suspended',
}

/** Alias for models that import `VerificationStatus` from this module. */
export { EVerificationStatus as VerificationStatus };

export enum EdeviceType {
    ANDROID = 'android',
    IOS = 'ios',
}

export enum OtpType {
    REGISTER = 'register',
    LOGIN = 'login',
    GENERIC = 'generic',
    ACTIVATEACCOUNT = 'activate-account',
    CHANGEPASSWORD = 'change-password',
    FORGOTPASSWORD = 'forgot-password',
}

// ---------------------------------------------------------------------------
// API parity: apps/api/src/types/common.enum.ts
// ---------------------------------------------------------------------------

export enum ContentType {
    SERMON = 'sermon',
    BITE = 'bite',
}

export enum ContentState {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
    BROKEN = 'broken',
}

export enum ContentStatus {
    PUBLISHED = 'published',
    PROCESSING = 'processing',
    DRAFT = 'draft',
    FLAGGED = 'flagged',
    DELETED = 'deleted',
    ARCHIVED = 'archived',
}

export enum CatalogueType {
    RECENTLYPLAYED = 'sermon',
    BITE = 'bite',
    MINISTER = 'Minister',
}

export enum DbModels {
    ADMIN = 'Admin',
    COMMENT = 'comment',
    CREATOR = 'creator',
    INVITATION = 'invitation',
    LIBRARY = 'library',
    LISTENER = 'listener',
    MINISTER = 'Minister',
    PERMISSION = 'permission',
    PLAN = 'plan',
    PLAYBACK = 'playback',
    PLAYBACK_SESSION = 'playbackSession',
    PLAYLIST = 'playlist',
    QUEUE = 'queue',
    ROLE = 'role',
    SERIES = 'series',
    SERMON = 'sermon',
    SHAREABLE_LINK = 'shareableLink',
    SUBSCRIPTION = 'subscription',
    SUBSCRIPTION_INTENT = 'subscriptionIntent',
    TRANSACTION = 'transaction',
    RECOMMENDATION = 'recommendation',
    TOPIC = 'topic',
    USER = 'user',
}

/** @deprecated Prefer {@link DbModels} (matches API). */
export enum EModels {
    USER = 'user',
    ROLE = 'role',
    PERMISSION = 'permission',
    API_KEY = 'ApiKey',
    BITE = 'bite',
    CATALOG = 'catalog',
    CREATOR = 'creator',
    LIBRARY = 'library',
    LISTENER = 'listener',
    PLAN = 'plan',
    PLAYLIST = 'playlist',
    MINISTER = 'minister',
    SUBSCRIPTION = 'subscription',
    SERIES = 'series',
    SERMON = 'sermon',
    ADMIN = 'admin',
    TRANSACTION = 'transaction',
}

export enum EmailService {
    SENDGRID = 'sendgrid',
    AWS_SES = 'ses',
    MAILTRAP = 'mailtrap',
    MAILGUN = 'mailgun',
    MAILSEND = 'mailsend',
    SMTP = 'smtp',
    ZEPTOMAIL = 'zeptomail',
}

export enum EmailTemplate {
    WELCOME = 'welcome',
    WELCOME_LISTENER = 'welcome-listener',
    WELCOME_MINISTER = 'welcome-minister',
    USER_INVITE = 'user-invite',
    PASSWORD_RESET = 'password-reset',
    PASSWORD_CHANGED = 'password-changed',
    EMAIL_VERIFICATION = 'email-verification',
    INVITE = 'invite',
    OTP = 'otp',
    VERIFY_EMAIL = 'verify-email',
    GENERIC = 'generic',
    SUBSCRIPTION_CONFIRMED = 'subscription-confirmed',
    SUBSCRIPTION_CANCELLED = 'subscription-cancelled',
    SUBSCRIPTION_EXPIRED = 'subscription-expired',
    SUBSCRIPTION_UPGRADED = 'subscription-upgraded',
    SUBSCRIPTION_DOWNGRADED = 'subscription-downgraded',
    SUBSCRIPTION_RENEWED = 'subscription-renewed',
    TRIAL_STARTED = 'trial-started',
    RECOMMENDATION = 'recommendation',
}

export enum EmailStatus {
    SENT = 'sent',
    DELIVERED = 'delivered',
    OPENED = 'opened',
    CLICKED = 'clicked',
    BOUNCED = 'bounced',
    SPAM = 'spam',
    UNSUBSCRIBED = 'unsubscribed',
    FAILED = 'failed',
    PENDING = 'pending',
    ERROR = 'error',
    DELAYED = 'delayed',
    QUEUED = 'queued',
    REJECTED = 'rejected',
    BLOCKED = 'blocked',
    INVALID = 'invalid',
    BLACKLISTED = 'blacklisted',
    COMPLAINED = 'complained',
    DEFERRED = 'deferred',
    UNDELIVERED = 'undelivered',
    TEMPORARY_FAILURE = 'temporary-failure',
    PERMANENT_FAILURE = 'permanent-failure',
    TIMEOUT = 'timeout',
    RETRY = 'retry',
    UNKNOWN = 'unknown',
    SUCCESS = 'success',
    FAILURE = 'failure',
}

export enum EmailType {
    TRANSACTIONAL = 'transactional',
    MARKETING = 'marketing',
    PRODUCT_UPDATE = 'product_update',
    FEATURE_ANNOUNCEMENT = 'feature_announcement',
}

export enum EmailPriority {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export enum OAuthProvider {
    GOOGLE = 'google',
    GITHUB = 'github',
    APPLE = 'apple',
}

export enum SermonType {
    SERIES = 'series',
    ONEOFF = 'one-off',
}

export enum PartType {
    ONE = 'one',
    TW0 = 'two',
    THREE = 'three',
    FOUR = 'four',
    FIVE = 'five',
    SIX = 'six',
    SEVEN = 'seven',
}

export enum S3Folder {
    IMAGES = 'images',
    AUDIO = 'audio',
    VIDEOS = 'videos',
    DOCUMENTS = 'documents',
    OTHERS = 'others',
}

// ---------------------------------------------------------------------------
// API parity: apps/api/src/types/user.enum.ts
// ---------------------------------------------------------------------------

export enum StaffUnit {
    ENGINEERING = 'engineering',
    PRODUCT = 'product',
    DESIGN = 'design',
    OPERATIONS = 'operations',
    FINANCE = 'finance',
}

export enum AdminRole {
    HEAD = 'head',
    MANAGER = 'manager',
    LEAD = 'lead',
    ASSOCIATE = 'assocaite',
    JUNIOR = 'junior',
}

export enum AccountManagerRole {
    OWNER = 'owner',
    MANAGER = 'manager',
    EDITOR = 'editor',
    ANALYST = 'analyst',
}

export enum AdminPermissions {
    Moderate = 'moderate',
    Create = 'create',
    ManageUsers = 'manageUsers',
    ManagePlaylists = 'managePlaylists',
    TrackEngagement = 'trackEngagement',
    FullAccess = 'fullAccess',
}

// ---------------------------------------------------------------------------
// API parity: apps/api/src/types/upload.enums.ts
// ---------------------------------------------------------------------------

export enum UploadStepType {
    IMAGE_UPLOADING = 'image-uploading',
    IMAGE_PROCESSED = 'image-processed',
    AUDIO_METADATA_PROCESSING = 'audio-metadata-processing',
    AUDIO_BITRATE_PROCESSING = 'audio-bitrate-processing',
    AUDIO_PROCESSED = 'audio-processed',
}

export enum UploadStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    EXPIRED = 'expired',
}

export enum ChunkStatus {
    PENDING = 'pending',
    UPLOADED = 'uploaded',
    FAILED = 'failed',
}

export enum ProcessingState {
    QUEUED = 'queued',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

// ---------------------------------------------------------------------------
// API parity: apps/api/src/types/payments.enums.ts
// ---------------------------------------------------------------------------

export enum Currency {
    NGN = 'NGN',
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    JPY = 'JPY',
    AUD = 'AUD',
    CAD = 'CAD',
    CHF = 'CHF',
    CNY = 'CNY',
    INR = 'INR',
    ZAR = 'ZAR',
}

/** @deprecated Prefer {@link Currency}; kept for existing `CurrencyType.*` usage. */
export import CurrencyType = Currency;

export enum PaymentProviders {
    PAYSTACK = 'Paystack',
    FLUTTERWAVE = 'Flutterwave',
    STRIPE = 'Stripe',
    PAYPAL = 'PayPal',
    SQUARE = 'Square',
    ALIPAY = 'Alipay',
    WECHAT_PAY = 'WeChat Pay',
}

export enum SubcriptionPlan {
    FREE = 'free',
    TRIAL = 'trial',
    PREMIUM = 'premium',
    FAMILY = 'family',
    STUDENT = 'student',
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
    TRIAL = 'trial',
}

export enum BillingFrequency {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export enum TransactionsType {
    SUBSCRIPTION = 'subscription',
    REFUND = 'refund',
    ONETIME = 'onetime',
    UPGRADE = 'upgrade',
    PAYMENT_METHOD_UPDATE = 'payment-method-update',
}

export enum TransactionType {
    CREDIT = 'credit',
    DEBIT = 'debit',
    DEFAULT = 'default',
}

export enum TransactionStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    FAILED = 'failed',
    SUCCESSFUL = 'successful',
    REFUNDED = 'refunded',
    DEFAULT = 'default',
    EXPIRED = 'expired',
}

export enum TransactionReason {
    PENDING = 'pending',
    ABANDONED = 'abandoned',
    FRAUDULENT = 'fraudulent',
    REFUNDED = 'refunded',
    COMPLETED = 'completed',
    FAILED = 'failed',
    ONGOING = 'ongoing',
    CANCELLED = 'cancelled',
    DEFAULT = 'default',
}
