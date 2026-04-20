export enum APIKeyEnvironment {
    LIVE = 'live',
    TEST = 'test',
}

export enum APIKeyStatus {
    ACTIVE = 'active',
    REVOKED = 'revoked',
    EXPIRED = 'expired',
    SUSPENDED = 'suspended',
}

export enum APIKeyType {
    FULL = 'full',
    READ = 'read',
    WRITE = 'write',
}
