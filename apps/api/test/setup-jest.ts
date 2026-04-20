/**
 * Lightweight Jest bootstrap (runs for every suite).
 * Use `test/setup.ts` for Mongo / app-wide mocks once legacy tests are migrated to troott paths.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-for-jest-only';
}
