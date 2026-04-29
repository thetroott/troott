import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { jest, beforeAll, beforeEach, afterAll } from '@jest/globals';
import emailServiceMock from './mocks/email.mock';
import redisMock from './mocks/redis.mock';
import storageServiceMock from './mocks/storage.mock';
import paystackServiceMock from './mocks/paystack.mock';

// Mock environment variables BEFORE any imports that use them
process.env.NODE_ENV = 'development'; // Use development for tests (required by email config)
process.env.APP_PORT = '3000';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRE = '30d';
process.env.MONGODB_DEV_URI = 'mongodb://localhost:27017/test';

// Mock email config environment variables
process.env.EMAIL_FROM_EMAIL = 'test@pacepard.com';
process.env.EMAIL_FROM_NAME = 'Pacepard Test';
process.env.EMAIL_REPLY_TO = 'test@pacepard.com';
process.env.MAILERSEND_API_KEY = 'test-api-key';
process.env.MAILSEND_TEMPLATE_ID = 'test-template-id';
process.env.EMAIL_DOMAIN = 'test.pacepard.com';
process.env.CLIENT_LOCAL_URL = 'http://localhost:3000';

// Mock AWS config
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.AWS_DEV_BUCKET_NAME = 'test-bucket';

// Mock Redis config
process.env.APP_ENV = 'development';
process.env.REDIS_HOST_DEV = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_USER = 'test';
process.env.REDIS_PASSWORD_DEV = 'test-password';
process.env.REDIS_DB = '0';
process.env.REDIS_TLS_REJECT_UNAUTHORIZED = 'false';

// Mock email config - must be before any imports that use it
jest.mock('../src/configs/email.config', () => {
    return {
        EMAIL_CONFIG: {
            service: 'mailsend',
            fromEmail: 'test@pacepard.com',
            fromName: 'Pacepard Test',
            replyTo: 'test@pacepard.com',
            apiKey: 'test-api-key',
            templateId: 'test-template-id',
            sendingDomain: 'test.pacepard.com',
            clientUrl: 'http://localhost:3000',
            isTestMode: true,
        },
        getEmailConfig: () => ({
            service: 'mailsend',
            fromEmail: 'test@pacepard.com',
            fromName: 'Pacepard Test',
            replyTo: 'test@pacepard.com',
            apiKey: 'test-api-key',
            templateId: 'test-template-id',
            sendingDomain: 'test.pacepard.com',
            clientUrl: 'http://localhost:3000',
            isTestMode: true,
        }),
    };
});

// Mock email service
jest.mock('../src/services/email.service', () => ({
    default: emailServiceMock,
    sendEmail: jest.fn<() => Promise<any>>().mockResolvedValue(true),
}));

// Mock Redis service
jest.mock('../src/middlewares/redis.mdw', () => ({
    default: redisMock,
}));

// Mock storage service
jest.mock('../src/services/storage.service', () => ({
    default: storageServiceMock,
}));

// Mock Paystack service (exports named functions)
jest.mock('../src/modules/paystack/paystack.service', () => ({
    initializePayment: paystackServiceMock.initializePayment,
    verifyTransaction: paystackServiceMock.verifyTransaction,
    paystackCreatePlan: paystackServiceMock.paystackCreatePlan,
    paystackPlanUpdate: paystackServiceMock.paystackPlanUpdate,
    verifyWebhookSignature: paystackServiceMock.verifyWebhookSignature,
}));

// Mock Bull library to prevent actual Redis connections
const createMockQueueInstance = () => {
    return {
        add: jest.fn<() => Promise<any>>().mockResolvedValue({
            id: 'mock-job-id',
            data: {},
        }),
        addBulk: jest.fn<() => Promise<any[]>>().mockResolvedValue([]),
        process: jest.fn(),
        on: jest.fn(),
        close: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        name: 'mock-queue',
    };
};

jest.mock('bull', () => {
    const createMockQueue = (name: string) => {
        const instance = createMockQueueInstance();
        instance.name = name;
        return instance;
    };

    // Simple constructor function
    function MockBull(this: any, name: string, options?: any) {
        if (!(this instanceof MockBull)) {
            return new (MockBull as any)(name, options);
        }
        return createMockQueue(name);
    }

    return MockBull;
});

// Mock queue/worker services
jest.mock('../src/tasks/workers/worker', () => ({
    default: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
}));

// Create a mock queue instance
const createMockQueue = () => {
    const mockQueue = {
        add: jest.fn<() => Promise<any>>().mockResolvedValue({
            id: 'mock-job-id',
            data: {},
        }),
        addBulk: jest.fn<() => Promise<any[]>>().mockResolvedValue([]),
        process: jest.fn(),
        on: jest.fn(),
        close: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        name: 'mock-queue',
    };
    return mockQueue;
};

jest.mock('../src/queues/queue', () => {
    const queues = new Map();

    const mockCreateQueue = jest
        .fn<(data: { name: string }) => Promise<any>>()
        .mockImplementation((data: { name: string }) => {
            const { name } = data;
            if (!queues.has(name)) {
                const queue = createMockQueue();
                queue.name = name;
                queues.set(name, queue);
            }
            return Promise.resolve(queues.get(name));
        });

    const mockAddJobs = jest
        .fn<(data: { queueName: string; jobs: any[] }) => Promise<void>>()
        .mockImplementation(async (data) => {
            const { queueName, jobs } = data;
            const queue = await mockCreateQueue({ name: queueName });
            // Mock the addBulk call
            const bulkJobs = jobs.map((job: any) => ({
                name: job.name,
                data: job.data,
                opts: job.options,
            }));
            await queue.addBulk(bulkJobs);
        });

    return {
        __esModule: true,
        default: {
            createQueue: mockCreateQueue,
            addJobs: mockAddJobs,
            addProcessor: jest
                .fn<
                    (data: { queueName: string }, callback: any) => Promise<any>
                >()
                .mockImplementation(async (data, callback) => {
                    const { queueName } = data;
                    const queue = await mockCreateQueue({ name: queueName });
                    return Promise.resolve(queue);
                }),
            getQueue: jest
                .fn<(name: string) => any>()
                .mockImplementation((name) => {
                    return queues.get(name) || createMockQueue();
                }),
            closeQueue: jest
                .fn<() => Promise<void>>()
                .mockResolvedValue(undefined),
        },
    };
});

// Mock AWS config
jest.mock('../src/configs/aws.config', () => ({
    s3: {
        send: jest.fn<() => Promise<any>>().mockResolvedValue({}),
    },
    AWS_BUCKET_NAME: 'test-bucket',
}));

// Mock AWS S3
jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({
        send: jest.fn<() => Promise<any>>().mockResolvedValue({}),
    })),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: jest
        .fn<() => Promise<string>>()
        .mockResolvedValue('https://test-signed-url.com'),
}));

// Mock email job processor
jest.mock('../src/tasks/jobs/email.job', () => ({
    default: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
}));

let mongo: MongoMemoryServer;

/**
 * Global test setup
 * Runs before all test suites
 */
beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    // Connect to in-memory database
    await mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
});

/**
 * Setup before each test
 * Clears database collections to ensure test isolation
 */
beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }

    // Clear all mocks
    jest.clearAllMocks();
});

/**
 * Cleanup after all tests
 * Closes database connections and stops in-memory server
 */
afterAll(async () => {
    // Close mongoose connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    // Stop in-memory MongoDB server
    await mongo.stop();
});

// Increase timeout for database operations
jest.setTimeout(30000);
// Export jest globals for use in test files
export {
    jest,
    describe,
    it,
    test,
    expect,
    beforeAll,
    beforeEach,
    afterAll,
    afterEach,
} from '@jest/globals';
