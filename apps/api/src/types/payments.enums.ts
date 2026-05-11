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
