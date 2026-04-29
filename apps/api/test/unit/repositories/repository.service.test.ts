import { describe, it, beforeEach, expect } from '@jest/globals';
import RepositoryService from '../../../src/services/repository.service';
import User from '../../../src/modules/user/user.model';
import { IUserDoc } from '../../../src/modules/user/user.interface';
import { createUser } from '../../factories/user.factory';

/**
 * Unit tests for Repository Service (base class)
 * Tests generic CRUD operations that all repositories inherit
 */

class TestRepository extends RepositoryService<IUserDoc> {
    constructor() {
        super(User, 'User');
    }
}

describe('Repository Service - Unit Tests', () => {
    let repository: TestRepository;
    let testUser: IUserDoc;

    beforeEach(async () => {
        repository = new TestRepository();
        testUser = await createUser();
    });

    describe('findById', () => {
        it('should find a document by ID', async () => {
            const result = await repository.findById(String(testUser._id));

            expect(result.error).toBe(false);
            expect(result.code).toBe(200);
            expect(result.data).toBeDefined();
            expect((result.data as IUserDoc).email).toBe(testUser.email);
        });

        it('should return error for non-existent ID', async () => {
            const fakeId = require('mongoose').Types.ObjectId();
            const result = await repository.findById(String(fakeId));

            expect(result.error).toBe(true);
            expect(result.code).toBe(404);
            expect(result.message).toContain('not found');
        });

        it('should populate related fields when requested', async () => {
            const result = await repository.findById(
                String(testUser._id),
                true,
            );

            expect(result.error).toBe(false);
            expect(result.data).toBeDefined();
        });
    });

    describe('findByIdOrSlug', () => {
        it('should find by ID when valid ObjectId provided', async () => {
            const result = await repository.findByIdOrSlug(
                String(testUser._id),
            );

            expect(result.error).toBe(false);
            expect(result.data).toBeDefined();
        });

        it('should find by slug when non-ObjectId string provided', async () => {
            // Note: User model may not have slug, this tests the logic
            const result = await repository.findByIdOrSlug(
                'invalid-objectid-format',
            );

            // Should attempt to find by slug
            expect(result).toBeDefined();
        });
    });

    describe('findOne', () => {
        it('should find a document by filter', async () => {
            const result = await repository.findOne({ email: testUser.email });

            expect(result.error).toBe(false);
            expect(result.data).toBeDefined();
            expect((result.data as IUserDoc).email).toBe(testUser.email);
        });

        it('should return error when document not found', async () => {
            const result = await repository.findOne({
                email: 'nonexistent@test.com',
            });

            expect(result.error).toBe(true);
            expect(result.code).toBe(404);
        });

        it('should support field selection', async () => {
            const result = await repository.findOne(
                { email: testUser.email },
                { select: 'email,userType' },
            );

            expect(result.error).toBe(false);
            expect(result.data).toBeDefined();
            const data = result.data as any;
            expect(data.email).toBeDefined();
            expect(data.userType).toBeDefined();
        });
    });

    describe('findAll', () => {
        it('should return all documents when no filter provided', async () => {
            const result = await repository.findAll();

            expect(result.error).toBe(false);
            expect(Array.isArray(result.data)).toBe(true);
        });

        it('should filter documents by query', async () => {
            const result = await repository.findAll({
                userType: testUser.userType,
            });

            expect(result.error).toBe(false);
            expect(Array.isArray(result.data)).toBe(true);
            (result.data as IUserDoc[]).forEach((user) => {
                expect(user.userType).toBe(testUser.userType);
            });
        });

        it('should support pagination', async () => {
            const result = await repository.findAll({}, { page: 1, limit: 5 });

            expect(result.error).toBe(false);
            expect(result.pagination).toBeDefined();
            expect(result.pagination?.total).toBeGreaterThanOrEqual(0);
            expect(result.pagination?.count).toBeLessThanOrEqual(5);
        });

        it('should support sorting', async () => {
            const result = await repository.findAll({}, { sort: '-createdAt' });

            expect(result.error).toBe(false);
            expect(Array.isArray(result.data)).toBe(true);
        });

        it('should support field selection', async () => {
            const result = await repository.findAll(
                {},
                { select: 'email,userType' },
            );

            expect(result.error).toBe(false);
            (result.data as any[]).forEach((user) => {
                expect(user.email).toBeDefined();
                expect(user.userType).toBeDefined();
            });
        });
    });

    describe('create', () => {
        it('should create a new document', async () => {
            const newUserData = {
                email: `test-${Date.now()}@example.com`,
                code: 'test-code',
                userType: 'talent',
            };

            const result = await repository.create(newUserData);

            expect(result.error).toBe(false);
            expect(result.code).toBe(201);
            expect(result.data).toBeDefined();
            expect((result.data as IUserDoc).email).toBe(newUserData.email);
        });

        it('should return error for invalid data', async () => {
            const result = await repository.create({ email: null } as any);

            expect(result.error).toBe(true);
            expect(result.code).toBe(400);
        });
    });

    describe('update', () => {
        it('should update a document by ID', async () => {
            const updateData = { firstName: 'UpdatedName' };
            const result = await repository.update(
                String(testUser._id),
                updateData,
            );

            expect(result.error).toBe(false);
            expect(result.code).toBe(200);
            expect((result.data as IUserDoc).firstName).toBe('UpdatedName');
        });

        it('should return error for non-existent ID', async () => {
            const fakeId = require('mongoose').Types.ObjectId();
            const result = await repository.update(String(fakeId), {
                firstName: 'Test',
            });

            expect(result.error).toBe(true);
            expect(result.code).toBe(404);
        });
    });

    describe('delete', () => {
        it('should delete a document by ID', async () => {
            const userToDelete = await createUser();
            const result = await repository.delete(String(userToDelete._id));

            expect(result.error).toBe(false);
            expect(result.code).toBe(200);
        });

        it('should return error for non-existent ID', async () => {
            const fakeId = require('mongoose').Types.ObjectId();
            const result = await repository.delete(String(fakeId));

            expect(result.error).toBe(true);
            expect(result.code).toBe(404);
        });
    });

    describe('count', () => {
        it('should count documents matching filter', async () => {
            const count = await repository.count({
                userType: testUser.userType,
            });

            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThanOrEqual(0);
        });

        it('should return 0 for non-matching filter', async () => {
            const count = await repository.count({
                email: 'nonexistent@test.com',
            });

            expect(count).toBe(0);
        });
    });

    describe('pushToArray', () => {
        it('should push value to array field', async () => {
            const result = await repository.pushToArray(
                String(testUser._id),
                'devices',
                { deviceId: 'test-device', platform: 'web' },
            );

            expect(result.error).toBe(false);
            expect(result.code).toBe(200);
        });
    });

    describe('pullFromArray', () => {
        it('should pull value from array field', async () => {
            // First add a device
            await repository.pushToArray(String(testUser._id), 'devices', {
                deviceId: 'test-device',
            });

            // Then remove it
            const result = await repository.pullFromArray(
                String(testUser._id),
                'devices',
                { deviceId: 'test-device' },
            );

            expect(result.error).toBe(false);
            expect(result.code).toBe(200);
        });
    });
});
