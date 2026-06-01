/**
 * Enums and small unions mirrored from `apps/api` interfaces.
 * Keep values in sync with API when those enums change.
 */

export enum PlanType {
    FOR_BUSINESS = 'business',
    FOR_LISTENER = 'listener',
}

export interface IPlanTrial {
    days: number;
    enabled: boolean;
}

export interface IPlanPricing {
    naira: { monthly: number; yearly: number };
    dollar: { monthly: number; yearly: number };
}

export interface IPlanPaystackCode {
    nairaMonthly: string;
    nairaYearly: string;
    dollarMonthly: string;
    dollarYearly: string;
}

export enum PlaylistType {
    MINISTER = 'minister',
    LISTENER = 'listener',
    SYSTEM = 'system',
    RECOMMENDATION = 'recommendation',
}

export enum PlaylistOwnerType {
    LISTENER = 'listener',
    MINISTER = 'minister',
    SYSTEM = 'system',
}

export enum PlaylistVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
    UNLISTED = 'unlisted',
}

export enum PlaylistStatus {
    ACTIVE = 'active',
    ARCHIVED = 'archived',
    DELETED = 'deleted',
}

/** Matches API `PlaylistItemResourceType`. */
export enum PlaylistItemResourceType {
    SERMON = 'sermon',
    SERIES = 'series',
}

export enum LibraryItemType {
    SERMON = 'sermon',
    PLAYLIST = 'playlist',
    SERIES = 'series',
    MINISTER = 'minister',
}

export enum LibraryItemAddedFrom {
    SEARCH = 'search',
    PLAYLIST = 'playlist',
    RECOMMENDATION = 'recommendation',
    MANUAL = 'manual',
}

export enum QueueItemSourceType {
    LISTENER = 'listener',
    SYSTEM = 'system',
    RECOMMENDATION = 'recommendation',
}

export enum QueueMediaType {
    SERMON = 'sermon',
    SERIES = 'series',
    PLAYLIST = 'playlist',
}

export enum Currency {
    NGN = 'NGN',
    USD = 'USD',
}

export enum BillingFrequency {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    PAST_DUE = 'past_due',
    TRIALING = 'trialing',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
}

export interface IDebitCard {
    authCode: string;
    cardBin: string;
    cardLast: string;
    expiryMonth: string;
    expiryYear: string;
    cardPan: string;
}

export interface IBilling {
    retries: number;
    startAt: Date;
    paidAt: Date;
    dueAt: Date;
    graceAt: Date;
    amount: number;
    frequency: BillingFrequency;
    isPaid: boolean;
}

export enum TransactionType {
    PAYMENT = 'PAYMENT',
    REFUND = 'REFUND',
    REVERSAL = 'REVERSAL',
    CHARGEBACK = 'CHARGEBACK',
    ADJUSTMENT = 'ADJUSTMENT',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

export enum MinisterStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

export enum VerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface ISocials {
    name: string;
    url: string;
    username: string;
}

export enum StudioType {
    CHURCH_BRANCH = 'church_branch',
    MINISTRY = 'ministry',
    PODCAST = 'podcast',
    MUSIC = 'music',
    CONFERENCE = 'conference',
    DEVOTIONAL = 'devotional',
    MEDIA_NETWORK = 'media_network',
    PERSONAL = 'personal',
}

export enum StudioRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    EDITOR = 'editor',
    UPLOADER = 'uploader',
    ANALYST = 'analyst',
}

export enum StudioStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING_REVIEW = 'pending_review',
}
