import { jest, expect } from '@jest/globals';
import { faker } from '@faker-js/faker';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/configs/app.config';
import { IUserDoc, UserType } from '../../src/modules/user/user.interface';
import User from '../../src/modules/user/user.model';
import tokenService from '../../src/services/token.service';
import authService from '../../src/modules/auth/auth.service';
import { genUserCode } from '../../src/utils/code.util';

/**
 * Test helper utilities for API testing
 */

export interface TestUser {
    user: IUserDoc;
    token: string;
}

/**
 * Creates a test user with authentication token
 */
export const createTestUser = async (
    overrides?: Partial<IUserDoc>,
): Promise<TestUser> => {
    const userType = overrides?.userType || UserType.TALENT;
    const userData = {
        email: faker.internet.email().toLowerCase(),
        password: 'Test@1234',
        code: genUserCode(userType),
        isActive: true,
        isActivated: true,
        isLocked: false,
        loginLimit: 0,
        userType,
        isTalent: userType === UserType.TALENT,
        isBusiness: userType === UserType.BUSINESS,
        isAdmin: userType === UserType.ADMIN,
        ...overrides,
    };

    const user = await User.create(userData);

    // Encrypt password
    await authService.encryptUserPassword(user, userData.password);
    await user.save();

    const tokenResult = await tokenService.attachToken(user);

    if (tokenResult.error || !tokenResult.data) {
        throw new Error('Failed to generate token for test user');
    }

    return {
        user,
        token: tokenResult.data.token,
    };
};

/**
 * Creates an admin test user with authentication token
 */
export const createAdminUser = async (): Promise<TestUser> => {
    return createTestUser({
        userType: UserType.ADMIN,
        isAdmin: true,
        isBusiness: false,
        isTalent: false,
    });
};

/**
 * Creates a business test user with authentication token
 */
export const createBusinessUser = async (): Promise<TestUser> => {
    return createTestUser({
        userType: UserType.BUSINESS,
        isBusiness: true,
        isAdmin: false,
        isTalent: false,
    });
};

/**
 * Creates a talent test user with authentication token
 */
export const createTalentUser = async (): Promise<TestUser> => {
    return createTestUser({
        userType: UserType.TALENT,
        isTalent: true,
        isAdmin: false,
        isBusiness: false,
    });
};

/**
 * Makes an authenticated request
 */
export const authenticatedRequest = (
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    token: string,
) => {
    const req = request(app)
        [method](url)
        .set('Authorization', `Bearer ${token}`);
    return req;
};

/**
 * Clears all collections in the database
 */
export const clearDatabase = async (): Promise<void> => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

/**
 * Drops all collections in the database
 */
export const dropDatabase = async (): Promise<void> => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].drop();
    }
};

/**
 * Waits for a specified amount of time
 */
export const wait = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Creates a mock Express request object
 */
export const createMockRequest = (
    overrides?: Partial<Request>,
): Partial<Request> => {
    return {
        body: {},
        params: {},
        query: {},
        headers: {},
        ...overrides,
    };
};

/**
 * Creates a mock Express response object
 * Returns 'any' type to avoid strict Express Response type checking in tests
 */
export const createMockResponse = (): any => {
    const mockReturnThis = jest.fn<() => any>().mockReturnThis();
    return {
        status: mockReturnThis,
        json: mockReturnThis,
        send: mockReturnThis,
        cookie: mockReturnThis,
        clearCookie: jest
            .fn<(name: string, options?: any) => any>()
            .mockReturnThis(),
        redirect: jest.fn<(url: string) => any>().mockReturnThis(),
    };
};

/**
 * Creates a mock Express next function
 */
export const createMockNext = (): NextFunction => {
    return jest.fn();
};

/**
 * Generates random test data
 */
export const generateTestData = {
    email: () => faker.internet.email().toLowerCase(),
    password: () => 'Test@1234',
    name: () => faker.person.fullName(),
    phone: () => faker.phone.number(),
    url: () => faker.internet.url(),
    uuid: () => faker.string.uuid(),
    date: () => faker.date.recent(),
    number: (min = 1, max = 100) => faker.number.int({ min, max }),
    string: (length = 10) => faker.string.alphanumeric(length),
    sentence: () => faker.lorem.sentence(),
    paragraph: () => faker.lorem.paragraph(),
};

/**
 * Asserts that a response has the standard API format
 */
export const expectStandardResponse = (response: any) => {
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('status');
};

/**
 * Asserts that a response is successful
 */
export const expectSuccessResponse = (response: any) => {
    expectStandardResponse(response);
    expect(response.body.error).toBe(false);
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
};

/**
 * Asserts that a response is an error
 */
export const expectErrorResponse = (response: any, statusCode?: number) => {
    expectStandardResponse(response);
    expect(response.body.error).toBe(true);
    if (statusCode) {
        expect(response.status).toBe(statusCode);
    }
};

/**
 * Asserts that a response has pagination
 */
export const expectPaginationResponse = (response: any) => {
    expectSuccessResponse(response);
    expect(response.body.data).toHaveProperty('pagination');
    expect(response.body.data.pagination).toHaveProperty('page');
    expect(response.body.data.pagination).toHaveProperty('limit');
    expect(response.body.data.pagination).toHaveProperty('total');
    expect(response.body.data.pagination).toHaveProperty('pages');
};
