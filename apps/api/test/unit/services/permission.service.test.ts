import { describe, it, beforeEach, expect } from '@jest/globals';
import {
    resolveUserPermissions,
    hasPermission,
} from '../../../src/services/permission.service';
import { createUser, createAdminUser } from '../../factories/user.factory';
import { IUserDoc } from '../../../src/modules/user/user.interface';
import Role from '../../../src/modules/role/role.model';
import { IRoleDoc } from '../../../src/modules/role/role.interface';

/**
 * Unit tests for Permission Service
 */

describe('Permission Service - Unit Tests', () => {
    let testUser: IUserDoc;
    let adminUser: IUserDoc;

    beforeEach(async () => {
        testUser = await createUser();
        adminUser = await createAdminUser();
    });

    describe('resolveUserPermissions', () => {
        it('should return empty set for user with no permissions', async () => {
            const permissions = await resolveUserPermissions(testUser);

            expect(permissions).toBeInstanceOf(Set);
            expect(permissions.size).toBe(0);
        });

        it('should return wildcard permissions for super user', async () => {
            // Make user a super user
            testUser.isSuper = true;
            await testUser.save();

            const permissions = await resolveUserPermissions(testUser);

            expect(permissions.has('*:*')).toBe(true);
            expect(permissions.size).toBeGreaterThan(0);
        });

        it('should resolve permissions from user document', async () => {
            // Add direct permissions to user
            testUser.permissions = ['project:create', 'project:read'] as any;
            await testUser.save();

            const permissions = await resolveUserPermissions(testUser);

            expect(permissions.has('project:create')).toBe(true);
            expect(permissions.has('project:read')).toBe(true);
        });

        it('should resolve permissions from user ID string', async () => {
            testUser.permissions = ['task:create'] as any;
            await testUser.save();

            const permissions = await resolveUserPermissions(
                String(testUser._id),
            );

            expect(permissions.has('task:create')).toBe(true);
        });

        it('should cache permissions in Redis', async () => {
            testUser.permissions = ['workspace:read'] as any;
            await testUser.save();

            // First call - should cache
            const permissions1 = await resolveUserPermissions(testUser);
            expect(permissions1.has('workspace:read')).toBe(true);

            // Second call - should use cache
            const permissions2 = await resolveUserPermissions(
                String(testUser._id),
            );
            expect(permissions2.has('workspace:read')).toBe(true);
        });
    });

    describe('hasPermission', () => {
        it('should return true for user with matching permission', async () => {
            testUser.permissions = ['project:create'] as any;
            await testUser.save();

            const hasAccess = await hasPermission(testUser, 'project:create');

            expect(hasAccess).toBe(true);
        });

        it('should return false for user without permission', async () => {
            const hasAccess = await hasPermission(testUser, 'project:delete');

            expect(hasAccess).toBe(false);
        });

        it('should return true for super user regardless of permission', async () => {
            testUser.isSuper = true;
            await testUser.save();

            const hasAccess = await hasPermission(testUser, 'any:permission');

            expect(hasAccess).toBe(true);
        });

        it('should support entity wildcard permissions', async () => {
            testUser.permissions = ['project:*'] as any;
            await testUser.save();

            const hasCreate = await hasPermission(testUser, 'project:create');
            const hasRead = await hasPermission(testUser, 'project:read');
            const hasDelete = await hasPermission(testUser, 'project:delete');

            expect(hasCreate).toBe(true);
            expect(hasRead).toBe(true);
            expect(hasDelete).toBe(true);
        });

        it('should support action wildcard permissions', async () => {
            testUser.permissions = ['*:read'] as any;
            await testUser.save();

            const hasProjectRead = await hasPermission(
                testUser,
                'project:read',
            );
            const hasTaskRead = await hasPermission(testUser, 'task:read');

            expect(hasProjectRead).toBe(true);
            expect(hasTaskRead).toBe(true);
        });

        it('should accept permission as object with entity and action', async () => {
            testUser.permissions = ['workspace:update'] as any;
            await testUser.save();

            const hasAccess = await hasPermission(testUser, {
                entity: 'workspace',
                action: 'update',
            });

            expect(hasAccess).toBe(true);
        });

        it('should handle resource ownership checks', async () => {
            testUser.permissions = ['project:update'] as any;
            await testUser.save();

            // User owns the resource
            const hasAccessOwn = await hasPermission(
                testUser,
                'project:update',
                {
                    resourceOwnerId: String(testUser._id),
                    checkOwnership: true,
                },
            );

            // User doesn't own the resource
            const hasAccessOther = await hasPermission(
                testUser,
                'project:update',
                {
                    resourceOwnerId: 'other-user-id',
                    checkOwnership: true,
                },
            );

            expect(hasAccessOwn).toBe(true);
            expect(hasAccessOther).toBe(false);
        });
    });
});
