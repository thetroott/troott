import type { Config } from 'jest';

/** AWS helpers import `aws.config` at module load; Jest uses `development` + dummy creds. */
process.env.NODE_ENV = 'development';
process.env.AWS_REGION ??= 'eu-central-1';
process.env.AWS_ACCESS_KEY_ID ??= 'jest-test-key';
process.env.AWS_SECRET_ACCESS_KEY ??= 'jest-test-secret';
process.env.AWS_STORAGE_BUCKET ??= 'troott-storage';
process.env.CLOUDFRONT_STORAGE_URL ??= 'https://storage.troott.com';

/**
 * Jest config for @troott/api.
 * - All test files live under `test/` (nothing co-located in `src/`).
 * - Uses CommonJS-aligned `ts-jest` (matches `tsconfig.json` `module: "CommonJS"`).
 * - For ESM + `ts-jest/presets/default-esm`, migrate the API package to `"type": "module"` first.
 */
const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    testMatch: ['**/*.test.ts', '**/*.spec.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.jest.json',
            },
        ],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.interface.ts',
        '!src/**/*.model.ts',
        '!src/**/index.ts',
        '!src/server.ts',
        '!src/configs/**',
        '!src/**/*.mock.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
    // Uncomment when coverage is consistently above these levels:
    // coverageThreshold: {
    //     global: { branches: 70, functions: 70, lines: 70, statements: 70 },
    // },
    setupFilesAfterEnv: ['<rootDir>/test/setup-jest.ts'],
    testTimeout: 30_000,
    maxWorkers: '50%',
    verbose: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    moduleDirectories: ['node_modules', '<rootDir>'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        // Legacy tests from another tree; remove as you port them to troott paths.
        '/test/integration/',
        '/test/unit/modules/',
        '/test/unit/repositories/',
        '/test/unit/services/token.service.test.ts',
        '/test/unit/services/permission.service.test.ts',
    ],
    transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|mongodb-memory-server))',
    ],
};

export default config;
