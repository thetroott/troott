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

