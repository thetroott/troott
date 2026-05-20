/** TanStack Query keys (canonical definitions in constants). */
export { MMKVStorageKeys, MutationKeys } from '@/constants/keys';

// ---------------------------------------------------------------------------
// API domain enums — single source: @troott/api/enums
// ---------------------------------------------------------------------------

export {
    AppChannel,
    BillingFrequency,
    CatalogueType,
    ChunkStatus,
    ContentState,
    ContentStatus,
    ContentType,
    Currency,
    DbModels,
    EmailPriority,
    EmailService,
    EmailStatus,
    EmailTemplate,
    EmailType,
    ENVType,
    OAuthProvider,
    PartType,
    PaymentProviders,
    ProcessingState,
    SermonType,
    SubcriptionPlan,
    SubscriptionStatus,
    TransactionReason,
    TransactionStatus,
    TransactionsType,
    TransactionType,
    UploadStatus,
    UploadStepType,
} from '@troott/api/enums';

// ---------------------------------------------------------------------------
// Client / UI (mobile-only)
// ---------------------------------------------------------------------------

export enum ImageResizeMode {
    CONTAIN = 'contain',
    COVER = 'cover',
    STRETCH = 'stretch',
    CENTER = 'center',
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

export enum S3Folder {
    IMAGES = 'images',
    AUDIO = 'audio',
    VIDEOS = 'videos',
    DOCUMENTS = 'documents',
    OTHERS = 'others',
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

/** @deprecated Prefer `Currency` from `@troott/api/enums`; kept for `CurrencyType.*` usage. */
export { Currency as CurrencyType } from '@troott/api/enums';
