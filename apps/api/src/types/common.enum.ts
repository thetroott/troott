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
    STUDIO = 'studio',
    SUBSCRIPTION = 'subscription',
    SUBSCRIPTION_INTENT = 'subscriptionIntent',
    TRANSACTION = 'transaction',
    RECOMMENDATION = 'recommendation',
    TOPIC = 'topic',
    USER = 'user',
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

