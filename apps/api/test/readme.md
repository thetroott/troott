# API Test Suite

Production-grade test setup for the Pacepard API using Jest, Supertest, and MongoDB Memory Server.

## Overview

This test suite provides comprehensive testing capabilities for the API including:

- **Unit Tests**: Testing individual functions and services
- **Integration Tests**: Testing API endpoints and workflows
- **E2E Tests**: Testing complete user flows

## Table of Contents

- [Quick Start](#quick-start)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Mocks and Factories](#mocks-and-factories)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Test Structure

```
test/
├── setup.ts                 # Global test setup and teardown
├── mocks/                   # Mock implementations for external services
│   ├── email.mock.ts
│   ├── paystack.mock.ts
│   ├── redis.mock.ts
│   └── storage.mock.ts
├── factories/               # Test data factories
│   ├── user.factory.ts
│   ├── business.factory.ts
│   └── ...
├── utils/                   # Test utilities and helpers
│   ├── api-client.ts       # Fluent API client for testing
│   └── test-helpers.ts     # Common test helper functions
├── unit/                    # Unit Tests
│   ├── modules/            # Module integration tests (HTTP endpoints)
│   │   ├── auth.test.ts
│   │   └── user.test.ts
│   ├── services/           # Service unit tests
│   │   ├── token.service.test.ts
│   │   └── permission.service.test.ts
│   └── repositories/       # Repository unit tests
│       └── repository.service.test.ts
└── integration/            # Cross-module integration tests
    └── workflow.test.ts
```

## Quick Start

### Prerequisites

1. **Install dependencies:**

    ```bash
    cd apps/api
    pnpm install
    ```

2. **Verify setup:**
    ```bash
    pnpm test --listTests
    ```
    This will list all available test files without running them.

### Environment Variables

Test environment variables are **automatically set** in `test/setup.ts`. No additional `.env` file is required for testing. The setup file configures:

- Database connection (MongoDB Memory Server)
- JWT secrets
- Email service mocks
- Redis mocks
- AWS S3 mocks
- All external service configurations

## Running Tests

### Basic Commands

#### Run All Tests

```bash
# From apps/api directory
pnpm test

# Or from monorepo root
pnpm test:api
```

**Output:** Runs all tests in the suite and displays results with pass/fail status.

#### Run Tests in Watch Mode

```bash
pnpm test:watch
```

**Use when:** Actively developing and want tests to re-run automatically on file changes.

**Features:**

- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `p` to filter by filename pattern
- Press `t` to filter by test name pattern
- Press `q` to quit watch mode

#### Run Tests with Coverage Report

```bash
pnpm test:coverage
```

**Output:**

- Terminal coverage summary
- HTML report: `coverage/index.html` (open in browser)
- LCOV report: `coverage/lcov.info` (for CI/CD)
- JSON summary: `coverage/coverage-summary.json`

**Coverage Thresholds:**

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Running Specific Tests

#### Run Tests by Category

**Unit Tests Only:**

```bash
pnpm test:unit
```

Runs all tests in `test/unit/` directory.

**Integration Tests Only:**

```bash
pnpm test:integration
```

Runs all tests in `test/integration/` directory.

**Module Tests Only:**

```bash
pnpm test:modules
```

Runs all tests in `test/unit/modules/` directory.

#### Run Specific Module Tests

**Using the test:module script (Recommended):**

```bash
# Run auth module tests
pnpm test:module auth

# Run user module tests
pnpm test:module user

# Run with watch mode
pnpm test:module auth --watch

# Available modules:
pnpm test:auth      # Auth module
pnpm test:user      # User module
pnpm test:token     # Token service
pnpm test:permission # Permission service
pnpm test:repository # Repository service
pnpm test:workflow  # Workflow integration tests
```

**Using Jest directly:**

```bash
# Run specific test file
pnpm test test/unit/modules/auth.test.ts

# Run tests matching a pattern
pnpm test --testNamePattern="should register"

# Run tests in a directory
pnpm test test/unit/modules/
```

#### Run Tests by Pattern

**By filename:**

```bash
# Run all auth-related tests
pnpm test auth

# Run all user-related tests
pnpm test user
```

**By test name:**

```bash
# Run tests with "register" in the name
pnpm test --testNamePattern="register"

# Run tests with "login" in the name
pnpm test --testNamePattern="login"
```

**By file path:**

```bash
# Run tests in unit/modules directory
pnpm test test/unit/modules/

# Run tests in unit/services directory
pnpm test test/unit/services/
```

### CI/CD Mode

```bash
pnpm test:ci
```

**Features:**

- Runs in CI mode (no watch, no interactive prompts)
- Generates coverage reports
- Uses 2 workers (optimized for CI environments)
- Fails if coverage thresholds are not met

### Advanced Options

#### Run Tests with Verbose Output

```bash
pnpm test --verbose
```

Shows individual test results instead of just pass/fail.

#### Run Tests in Parallel (or Serial)

```bash
# Run tests in parallel (default)
pnpm test

# Run tests serially (one at a time)
pnpm test --runInBand
```

#### Run Only Failed Tests

```bash
# After a test run, re-run only failed tests
pnpm test --onlyFailures
```

#### Run Tests with Timeout Override

```bash
# Set custom timeout (default is 30 seconds)
pnpm test --testTimeout=60000
```

#### Run Tests with Specific Workers

```bash
# Use 4 workers
pnpm test --maxWorkers=4

# Use 50% of available CPUs (default)
pnpm test --maxWorkers=50%
```

#### Run Tests and Update Snapshots

```bash
pnpm test --updateSnapshot
# or
pnpm test -u
```

### Example Workflows

**Development Workflow:**

```bash
# 1. Start watch mode for the module you're working on
pnpm test:module auth --watch

# 2. Make changes to code
# 3. Tests automatically re-run

# 4. Before committing, run full test suite
pnpm test
```

**Debugging Failed Tests:**

```bash
# 1. Run the failing test
pnpm test:module auth

# 2. Run with verbose output to see details
pnpm test:module auth --verbose

# 3. Run only the failing test
pnpm test test/unit/modules/auth.test.ts --testNamePattern="should register"

# 4. Use Node debugger
node --inspect-brk node_modules/.bin/jest test/unit/modules/auth.test.ts
```

**Pre-commit Checklist:**

```bash
# 1. Run all tests
pnpm test

# 2. Check coverage
pnpm test:coverage

# 3. Verify no linting errors
pnpm lint

# 4. Run type checking
pnpm check-types
```

## Test Utilities

### API Client

The `ApiClient` provides a fluent interface for making authenticated requests:

```typescript
import {
    createApiClient,
    createAuthenticatedClient,
} from '../utils/api-client';

// Create unauthenticated client
const client = createApiClient();
const response = await client.get('/api/v1/auth/register');

// Create authenticated client with token
const authClient = await createAuthenticatedClient();
const profile = await authClient.get('/api/v1/user/profile').expect(200);

// Make POST request
const result = await authClient
    .post('/api/v1/projects')
    .send({ name: 'Test Project' })
    .expect(201);
```

**API Client Methods:**

- `get(url)` - GET request
- `post(url)` - POST request
- `put(url)` - PUT request
- `patch(url)` - PATCH request
- `delete(url)` - DELETE request
- `set(header, value)` - Set request header
- `expect(status)` - Assert response status

### Test Helpers

Common test helper functions for assertions and data creation:

```typescript
import {
    createTestUser,
    createAdminUser,
    createBusinessUser,
    createTalentUser,
    expectSuccessResponse,
    expectErrorResponse,
    expectStandardResponse,
    expectPaginationResponse,
    generateTestData,
} from '../utils/test-helpers';

// Create test users with authentication tokens
const user = await createTestUser(); // Returns { user, token }
const admin = await createAdminUser(); // Returns { user, token }
const business = await createBusinessUser(); // Returns { user, token }
const talent = await createTalentUser(); // Returns { user, token }

// Use the token for authenticated requests
const response = await request(app)
    .get('/api/v1/user/profile')
    .set('Authorization', `Bearer ${user.token}`);

// Assert response format
expectSuccessResponse(response); // Checks error: false, status 2xx, has data
expectErrorResponse(response, 400); // Checks error: true, specific status code
expectStandardResponse(response); // Checks basic response structure
expectPaginationResponse(response); // Checks paginated response structure

// Generate test data
const email = generateTestData.email(); // Random email
const password = generateTestData.password(); // 'Test@1234'
const name = generateTestData.name(); // Random full name
const phone = generateTestData.phone(); // Random phone number
const uuid = generateTestData.uuid(); // Random UUID
```

### Factories

Test data factories for creating test entities in the database:

```typescript
import {
    createUser,
    createTalentUser,
    createAdminUser,
    createBusinessUser,
    createUserData,
} from '../factories/user.factory';

// Create a user with default options
const user = await createUser();

// Create a user with custom options
const customUser = await createUser({
    userType: UserType.TALENT,
    isActive: true,
    isActivated: true,
    email: 'custom@example.com',
    password: 'CustomPass123!',
});

// Create specific user types (returns IUserDoc)
const talent = await createTalentUser();
const admin = await createAdminUser();
const business = await createBusinessUser();

// Create user data without saving (returns Partial<IUserDoc>)
const userData = createUserData({ userType: UserType.TALENT });
```

**Factory Options:**

- `userType`: UserType enum (TALENT, BUSINESS, ADMIN, etc.)
- `isActive`: boolean
- `isActivated`: boolean
- `isLocked`: boolean
- `email`: string
- `password`: string
- `isAdmin`, `isBusiness`, `isTalent`: boolean flags
- `passwordType`: PasswordType enum

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, beforeEach, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/configs/app.config';
import {
    createTestUser,
    expectSuccessResponse,
    expectErrorResponse,
    generateTestData,
} from '../utils/test-helpers';

describe('Module Name - Integration Tests', () => {
    const baseUrl = '/api/v1/module';
    let testUser: any;

    beforeEach(async () => {
        // Clear any existing test data
        testUser = null;
    });

    describe('POST /module/create', () => {
        it('should create a new resource successfully', async () => {
            testUser = await createTestUser();

            const resourceData = {
                name: generateTestData.name(),
                email: generateTestData.email(),
            };

            const response = await request(app)
                .post(`${baseUrl}/create`)
                .set('Authorization', `Bearer ${testUser.token}`)
                .send(resourceData);

            expectSuccessResponse(response);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(resourceData.name);
        });

        it('should reject creation with invalid data', async () => {
            testUser = await createTestUser();

            const response = await request(app)
                .post(`${baseUrl}/create`)
                .set('Authorization', `Bearer ${testUser.token}`)
                .send({}); // Empty data

            expectErrorResponse(response, 400);
            expect(response.body.message).toContain('required');
        });
    });

    describe('GET /module/:id', () => {
        beforeEach(async () => {
            testUser = await createTestUser();
        });

        it('should return resource by id', async () => {
            // Create a resource first
            const createResponse = await request(app)
                .post(`${baseUrl}/create`)
                .set('Authorization', `Bearer ${testUser.token}`)
                .send({ name: 'Test Resource' });

            const resourceId = createResponse.body.data.id;

            // Get the resource
            const response = await request(app)
                .get(`${baseUrl}/${resourceId}`)
                .set('Authorization', `Bearer ${testUser.token}`);

            expectSuccessResponse(response);
            expect(response.body.data.id).toBe(resourceId);
        });

        it('should return 404 for non-existent resource', async () => {
            const response = await request(app)
                .get(`${baseUrl}/nonexistent-id`)
                .set('Authorization', `Bearer ${testUser.token}`);

            expectErrorResponse(response, 404);
        });
    });
});
```

### Using API Client

```typescript
import { describe, it, expect } from '@jest/globals';
import { createAuthenticatedClient } from '../utils/api-client';

describe('Module Name - API Client Tests', () => {
    it('should handle authenticated request', async () => {
        const client = await createAuthenticatedClient();

        const response = await client.get('/api/v1/user/profile').expect(200);

        expect(response.body.error).toBe(false);
        expect(response.body.data).toHaveProperty('email');
    });

    it('should handle POST request with data', async () => {
        const client = await createAuthenticatedClient();

        const response = await client
            .post('/api/v1/projects')
            .send({
                name: 'Test Project',
                description: 'Test Description',
            })
            .expect(201);

        expect(response.body.error).toBe(false);
        expect(response.body.data).toHaveProperty('id');
    });
});
```

### Test Organization Patterns

**Pattern 1: Group by Endpoint**

```typescript
describe('Auth Module', () => {
    describe('POST /auth/register', () => {
        it('should register successfully', () => {});
        it('should reject invalid email', () => {});
        it('should reject weak password', () => {});
    });

    describe('POST /auth/login', () => {
        it('should login successfully', () => {});
        it('should reject invalid credentials', () => {});
    });
});
```

**Pattern 2: Group by Feature**

```typescript
describe('User Management', () => {
    describe('User Registration', () => {
        it('should register new user', () => {});
        it('should send verification email', () => {});
    });

    describe('User Authentication', () => {
        it('should login user', () => {});
        it('should logout user', () => {});
    });
});
```

### Common Test Scenarios

**Testing Success Cases:**

```typescript
it('should return success response with correct data', async () => {
    const response = await request(app)
        .get('/api/v1/endpoint')
        .set('Authorization', `Bearer ${token}`);

    expectSuccessResponse(response);
    expect(response.body.data).toHaveProperty('expectedField');
    expect(response.body.data.expectedField).toBe('expectedValue');
});
```

**Testing Error Cases:**

```typescript
it('should return 400 for invalid input', async () => {
    const response = await request(app)
        .post('/api/v1/endpoint')
        .send({ invalid: 'data' });

    expectErrorResponse(response, 400);
    expect(response.body.message).toContain('error message');
});
```

**Testing Authentication:**

```typescript
it('should reject request without token', async () => {
    const response = await request(app).get('/api/v1/protected-endpoint');

    expectErrorResponse(response, 401);
});

it('should reject request with invalid token', async () => {
    const response = await request(app)
        .get('/api/v1/protected-endpoint')
        .set('Authorization', 'Bearer invalid-token');

    expectErrorResponse(response, 401);
});
```

**Testing Validation:**

```typescript
it('should validate required fields', async () => {
    const response = await request(app).post('/api/v1/endpoint').send({}); // Missing required fields

    expectErrorResponse(response, 400);
    expect(response.body.message).toContain('required');
});
```

**Testing Database Operations:**

```typescript
it('should create and retrieve resource', async () => {
    // Create
    const createResponse = await request(app)
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });

    const resourceId = createResponse.body.data.id;

    // Retrieve
    const getResponse = await request(app)
        .get(`/api/v1/resources/${resourceId}`)
        .set('Authorization', `Bearer ${token}`);

    expectSuccessResponse(getResponse);
    expect(getResponse.body.data.id).toBe(resourceId);
});
```

## Mocks and Factories

### Automatic Mocks

External services are **automatically mocked** in `test/setup.ts`. No configuration needed:

- **Email Service** (`email.service.ts`): All email sending is mocked
- **Redis** (`redis.mdw.ts`): Redis operations are mocked (get, set, del, etc.)
- **AWS S3** (`storage.service.ts`): File uploads/downloads are mocked
- **Paystack** (`paystack.service.ts`): Payment processing is mocked
- **Bull Queue** (`queue.ts`): Job queue operations are mocked
- **Workers** (`worker.ts`): Background job workers are mocked

### Using Mocks in Tests

Mocks are automatically applied, but you can access and verify them:

```typescript
import emailService from '../../src/services/email.service';

it('should send email', async () => {
    // Make request that triggers email
    await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: 'Test@1234' });

    // Verify email service was called (if needed)
    // Note: Check the mock implementation in test/mocks/email.mock.ts
});
```

### Custom Mocks

If you need custom mocks for specific tests:

```typescript
import { jest } from '@jest/globals';

// Mock a specific function
jest.mock('../../src/services/custom.service', () => ({
    default: {
        customMethod: jest.fn().mockResolvedValue({ success: true }),
    },
}));
```

### Factories

**User Factory:**

```typescript
import {
    createUser,
    createTalentUser,
    createBusinessUser,
    createAdminUser,
    createUserData,
} from '../factories/user.factory';

// Create and save user to database
const user = await createUser({
    userType: UserType.TALENT,
    email: 'test@example.com',
});

// Create user data without saving
const userData = createUserData({ userType: UserType.BUSINESS });
```

**Other Factories:**

```typescript
// Business factory
import { createBusiness } from '../factories/business.factory';
const business = await createBusiness({ name: 'Test Business' });

// Project factory
import { createProject } from '../factories/project.factory';
const project = await createProject({ name: 'Test Project' });

// Task factory
import { createTask } from '../factories/task.factory';
const task = await createTask({ title: 'Test Task' });
```

## Database

### MongoDB Memory Server

Tests use **MongoDB Memory Server** - an in-memory MongoDB instance that:

- ✅ Runs automatically for each test suite
- ✅ Is isolated between test runs
- ✅ Is cleared before each test (`beforeEach` hook)
- ✅ Requires **no external MongoDB setup**
- ✅ Fast and lightweight
- ✅ Automatically cleaned up after tests

### Database Lifecycle

1. **Before All Tests** (`beforeAll`):
    - MongoDB Memory Server starts
    - Database connection is established
    - All collections are available

2. **Before Each Test** (`beforeEach`):
    - All collections are cleared (`deleteMany({})`)
    - Fresh database state for each test
    - Mocks are reset

3. **After All Tests** (`afterAll`):
    - Database is dropped
    - Connection is closed
    - Memory Server is stopped

### Working with Database in Tests

```typescript
import mongoose from 'mongoose';
import User from '../../src/modules/user/user.model';

describe('Database Operations', () => {
    it('should create user in database', async () => {
        const user = await User.create({
            email: 'test@example.com',
            password: 'hashedPassword',
        });

        expect(user._id).toBeDefined();
        expect(user.email).toBe('test@example.com');
    });

    it('should query database', async () => {
        await User.create({ email: 'test@example.com' });

        const found = await User.findOne({ email: 'test@example.com' });
        expect(found).toBeDefined();
    });

    it('should have clean database', async () => {
        // This test runs after beforeEach, so database is empty
        const count = await User.countDocuments();
        expect(count).toBe(0);
    });
});
```

### Database Isolation

Each test runs with a clean database:

```typescript
describe('Test Suite', () => {
    it('test 1', async () => {
        await User.create({ email: 'user1@example.com' });
        // Database has 1 user
    });

    it('test 2', async () => {
        // Database is empty again (cleared in beforeEach)
        const count = await User.countDocuments();
        expect(count).toBe(0);
    });
});
```

## Coverage

### Generating Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Coverage Reports

Reports are generated in the `coverage/` directory:

- **HTML Report** (`coverage/index.html`): Interactive browser-based report
    - Click on files to see line-by-line coverage
    - Red lines = not covered
    - Yellow lines = partially covered
    - Green lines = fully covered

- **LCOV Report** (`coverage/lcov.info`): Machine-readable format for CI/CD
    - Used by code coverage services (Codecov, Coveralls, etc.)
    - Can be uploaded to coverage tracking tools

- **JSON Summary** (`coverage/coverage-summary.json`): Programmatic access
    ```json
    {
        "total": {
            "lines": { "total": 1000, "covered": 850, "pct": 85 },
            "statements": { "total": 1200, "covered": 1020, "pct": 85 },
            "functions": { "total": 200, "covered": 180, "pct": 90 },
            "branches": { "total": 500, "covered": 400, "pct": 80 }
        }
    }
    ```

### Coverage Thresholds

Minimum coverage requirements (enforced in CI):

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

If thresholds are not met, tests will fail.

### Excluded from Coverage

The following are excluded from coverage calculations:

- Type definitions (`.d.ts` files)
- Interfaces (`.interface.ts` files)
- Models (`.model.ts` files)
- Index files (`index.ts`)
- Server entry point (`server.ts`)
- Config files (`src/configs/**`)
- Mock files (`**/*.mock.ts`)

### Improving Coverage

1. **Identify uncovered code:**

    ```bash
    pnpm test:coverage
    # Open coverage/index.html and look for red/yellow lines
    ```

2. **Add tests for uncovered code:**
    - Focus on business logic first
    - Test error cases and edge conditions
    - Test validation logic

3. **Verify improvement:**
    ```bash
    pnpm test:coverage
    # Check that coverage percentages increased
    ```

## Best Practices

### 1. Test Isolation

Each test should be **completely independent**:

```typescript
// ❌ BAD: Tests depend on each other
it('test 1', () => {
    global.data = 'value';
});

it('test 2', () => {
    expect(global.data).toBe('value'); // Depends on test 1
});

// ✅ GOOD: Each test is independent
it('test 1', () => {
    const data = 'value';
    expect(data).toBe('value');
});

it('test 2', () => {
    const data = 'value';
    expect(data).toBe('value');
});
```

### 2. Clean Setup

Always use `beforeEach` for fresh test data:

```typescript
describe('User Tests', () => {
    let testUser: any;

    beforeEach(async () => {
        // Fresh user for each test
        testUser = await createTestUser();
    });

    it('test 1', () => {
        // Uses fresh testUser
    });

    it('test 2', () => {
        // Uses different fresh testUser (database was cleared)
    });
});
```

### 3. Descriptive Test Names

Use clear, descriptive test names that explain what is being tested:

```typescript
// ❌ BAD
it('works', () => {});
it('test 1', () => {});

// ✅ GOOD
it('should register a new user successfully', () => {});
it('should reject registration with invalid email format', () => {});
it('should return 401 when authentication token is missing', () => {});
```

### 4. Arrange-Act-Assert Pattern

Structure tests with clear sections:

```typescript
it('should create resource', async () => {
    // Arrange: Set up test data
    const user = await createTestUser();
    const resourceData = { name: 'Test Resource' };

    // Act: Perform the action
    const response = await request(app)
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${user.token}`)
        .send(resourceData);

    // Assert: Verify the result
    expectSuccessResponse(response);
    expect(response.body.data.name).toBe(resourceData.name);
});
```

### 5. Test Edge Cases

Include tests for error cases and edge conditions:

```typescript
describe('Input Validation', () => {
    it('should handle empty input', () => {});
    it('should handle null input', () => {});
    it('should handle invalid format', () => {});
    it('should handle missing required fields', () => {});
    it('should handle extremely long input', () => {});
    it('should handle special characters', () => {});
});
```

### 6. Use Factories

Always use factories for creating test data:

```typescript
// ❌ BAD: Manual data creation
const user = await User.create({
    email: 'test@example.com',
    password: 'hashed',
    // ... many fields
});

// ✅ GOOD: Use factory
const user = await createTestUser();
```

### 7. Mock External Services

Always mock external services (automatically done in setup.ts):

- Email services
- Payment processors
- File storage
- Third-party APIs
- Background job queues

### 8. Test One Thing at a Time

Each test should verify one specific behavior:

```typescript
// ❌ BAD: Testing multiple things
it('should create and update user', async () => {
    // Creates user
    // Updates user
    // Tests both
});

// ✅ GOOD: Separate tests
it('should create user', async () => {
    // Only tests creation
});

it('should update user', async () => {
    // Only tests update
});
```

### 9. Use Appropriate Assertions

Use specific assertions:

```typescript
// ❌ BAD: Generic assertion
expect(response.body).toBeTruthy();

// ✅ GOOD: Specific assertion
expectSuccessResponse(response);
expect(response.body.data).toHaveProperty('id');
expect(response.body.data.email).toBe('test@example.com');
```

### 10. Clean Up Resources

Tests automatically clean up, but be mindful of:

- Open connections
- Timers/intervals
- Event listeners
- File handles

### 11. Test Performance Considerations

- Keep tests fast (use mocks, not real services)
- Use `beforeAll` for expensive setup (sparingly)
- Use `beforeEach` for most setup
- Avoid unnecessary database operations

### 12. Documentation

Document complex test scenarios:

```typescript
it('should handle concurrent requests', async () => {
    // This test verifies that the system correctly handles
    // multiple simultaneous requests to the same endpoint
    // without race conditions or data corruption.

    const promises = Array(10)
        .fill(null)
        .map(() => request(app).post('/api/v1/endpoint'));

    const results = await Promise.all(promises);
    // ... assertions
});
```

## CI/CD Integration

The test suite is configured for CI/CD:

```yaml
# Example GitHub Actions
- name: Run tests
  run: pnpm test:ci
```

## Troubleshooting

### Common Issues and Solutions

#### Tests Timeout

**Problem:** Tests fail with timeout errors.

**Solution 1:** Increase timeout in `jest.config.ts`:

```typescript
testTimeout: 60000, // 60 seconds (default is 30)
```

**Solution 2:** Increase timeout for specific test:

```typescript
it('slow test', async () => {
    // Test code
}, 60000); // 60 second timeout
```

**Solution 3:** Check for:

- Long-running operations (use mocks)
- Database queries (optimize or mock)
- Network requests (should be mocked)

#### Database Connection Issues

**Problem:** MongoDB Memory Server fails to start.

**Solutions:**

1. **Check installation:**

    ```bash
    pnpm list mongodb-memory-server
    ```

2. **Check system memory:**
    - MongoDB Memory Server needs ~500MB RAM
    - Close other applications if low on memory

3. **Check logs:**

    ```bash
    pnpm test --verbose
    # Look for MongoDB connection errors
    ```

4. **Clear cache:**

    ```bash
    rm -rf node_modules/.cache
    pnpm install
    ```

5. **Manual cleanup:**
    ```bash
    # Kill any stuck MongoDB processes
    pkill -f mongod
    ```

#### Mock Not Working

**Problem:** Mocks aren't being applied.

**Solutions:**

1. **Ensure mocks are in setup.ts:**

    ```typescript
    // test/setup.ts
    jest.mock('../src/services/email.service', () => ({
        default: emailServiceMock,
    }));
    ```

2. **Check mock is imported before module:**

    ```typescript
    // Mocks must be before imports
    jest.mock('../../src/services/email.service');
    import emailService from '../../src/services/email.service';
    ```

3. **Clear Jest cache:**
    ```bash
    pnpm test --clearCache
    ```

#### "Circular Structure" Errors

**Problem:** Error: "Converting circular structure to JSON"

**Solution:** This usually happens with Redis/Bull mocks. Ensure mocks return plain objects, not circular references. Check `test/setup.ts` for proper mock implementations.

#### "user.save is not a function"

**Problem:** User objects from repository don't have `.save()` method.

**Solution:** Repository uses `.lean()` which returns plain objects. Fetch as Mongoose document:

```typescript
// In controller or service
const userDoc = await User.findById(user._id || user.id);
await userDoc.save();
```

#### Tests Pass Individually but Fail Together

**Problem:** Test isolation issue.

**Solutions:**

1. **Check for shared state:**

    ```typescript
    // ❌ BAD: Shared state
    let globalData = {};

    // ✅ GOOD: Local state
    beforeEach(() => {
        const localData = {};
    });
    ```

2. **Ensure database is cleared:**

    ```typescript
    beforeEach(async () => {
        // Database is automatically cleared in setup.ts
    });
    ```

3. **Clear mocks:**
    ```typescript
    beforeEach(() => {
        jest.clearAllMocks(); // Already done in setup.ts
    });
    ```

#### Import Errors

**Problem:** Module not found or import errors.

**Solutions:**

1. **Check import paths:**

    ```typescript
    // From test/unit/modules/auth.test.ts
    import app from '../../../src/configs/app.config'; // ✅
    import app from '../../src/configs/app.config'; // ❌
    ```

2. **Use path aliases:**

    ```typescript
    // jest.config.ts has: '^@/(.*)$': '<rootDir>/src/$1'
    import app from '@/configs/app.config';
    ```

3. **Check TypeScript config:**
    ```bash
    pnpm check-types
    ```

#### Coverage Not Generating

**Problem:** Coverage reports not created.

**Solutions:**

1. **Run with coverage flag:**

    ```bash
    pnpm test:coverage
    ```

2. **Check coverage directory:**

    ```bash
    ls -la coverage/
    ```

3. **Check .gitignore:**
    ```bash
    # coverage/ should NOT be in .gitignore for reports
    ```

#### Jest Cache Issues

**Problem:** Tests showing old results or mocks not updating.

**Solution:** Clear Jest cache:

```bash
pnpm test --clearCache
# Or
rm -rf node_modules/.cache/jest
```

#### TypeScript Errors in Tests

**Problem:** TypeScript compilation errors in test files.

**Solutions:**

1. **Check tsconfig.test.json:**

    ```bash
    cat tsconfig.test.json
    ```

2. **Run type check:**

    ```bash
    pnpm check-types
    ```

3. **Ensure test files use correct imports:**
    ```typescript
    import { describe, it, expect } from '@jest/globals';
    ```

### Getting Help

1. **Check test logs:**

    ```bash
    pnpm test --verbose
    ```

2. **Run specific failing test:**

    ```bash
    pnpm test:module auth --verbose
    ```

3. **Check Jest documentation:**
    - https://jestjs.io/docs/getting-started

4. **Review test setup:**
    - Check `test/setup.ts` for configuration
    - Check `jest.config.ts` for Jest settings
    - Check `package.json` for test scripts

## Quick Reference

### Command Cheat Sheet

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Run specific module
pnpm test:module auth
pnpm test:module user --watch

# Run by category
pnpm test:unit
pnpm test:integration
pnpm test:modules

# CI mode
pnpm test:ci

# Specific test file
pnpm test test/unit/modules/auth.test.ts

# With pattern
pnpm test --testNamePattern="register"
```

### File Structure Quick Reference

```
test/
├── setup.ts              # Global setup (runs before all tests)
├── mocks/                # Service mocks
├── factories/            # Test data factories
├── utils/                # Test utilities
├── unit/                 # Unit tests
│   ├── modules/          # Module integration tests (HTTP endpoints)
│   ├── services/         # Service unit tests
│   └── repositories/     # Repository unit tests
└── integration/         # Cross-module integration tests
```

### Import Paths Reference

From `test/unit/modules/auth.test.ts`:

```typescript
// Source code
import app from '../../../src/configs/app.config';
import User from '../../../src/modules/user/user.model';

// Test utilities
import { createTestUser } from '../../utils/test-helpers';
import { createUser } from '../../factories/user.factory';

// Mocks
import emailServiceMock from '../../mocks/email.mock';
```

## Contributing

When adding new tests:

1. **Follow existing structure:**
    - Module integration tests → `test/unit/modules/`
    - Service unit tests → `test/unit/services/`
    - Repository unit tests → `test/unit/repositories/`
    - Cross-module integration tests → `test/integration/`

2. **Use provided utilities:**
    - `createTestUser()`, `expectSuccessResponse()`, etc.
    - Factories for test data
    - Mocks for external services

3. **Add appropriate mocks:**
    - If using new external service, add mock to `test/mocks/`
    - Register mock in `test/setup.ts`

4. **Maintain coverage:**
    - Keep coverage above 70% thresholds
    - Add tests for new features
    - Test error cases and edge conditions

5. **Update documentation:**
    - Update this README if adding new utilities
    - Document complex test scenarios
    - Add examples for new patterns

6. **Follow best practices:**
    - Test isolation
    - Descriptive names
    - Arrange-Act-Assert pattern
    - One assertion per test (when possible)

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** 2024
**Maintained by:** Pacepard Development Team
