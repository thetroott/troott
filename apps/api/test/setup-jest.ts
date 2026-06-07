/**
 * Lightweight Jest bootstrap (runs for every suite).
 * Use `test/setup.ts` for Mongo / app-wide mocks once legacy tests are migrated to troott paths.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-for-jest-only';
}
if (!process.env.JWT_EXPIRY) {
    process.env.JWT_EXPIRY = '30d';
}

// Redis config loads at import time via routes/controllers (e.g. sermon.router-order.test).
process.env.APP_ENV = process.env.APP_ENV || 'development';
process.env.REDIS_HOST_DEV = process.env.REDIS_HOST_DEV || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.REDIS_USER = process.env.REDIS_USER || 'test';
process.env.REDIS_PASSWORD_DEV = process.env.REDIS_PASSWORD_DEV || 'test-password';
process.env.REDIS_DB = process.env.REDIS_DB || '0';
process.env.REDIS_TLS_REJECT_UNAUTHORIZED =
    process.env.REDIS_TLS_REJECT_UNAUTHORIZED || 'false';
process.env.REDIS_CONFIG = process.env.REDIS_CONFIG || 'false';
