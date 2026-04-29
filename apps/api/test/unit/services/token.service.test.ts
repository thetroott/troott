import { describe, it, beforeEach, expect } from '@jest/globals';
import tokenService from '../../../src/services/token.service';
import { createUser } from '../../factories/user.factory';
import { IUserDoc } from '../../../src/modules/user/user.interface';
import User from '../../../src/modules/user/user.model';

/**
 * Unit tests for Token Service
 */

describe('Token Service - Unit Tests', () => {
    let testUser: IUserDoc;

    beforeEach(async () => {
        testUser = await createUser();
    });

    describe('attachToken', () => {
        it('should generate and attach a JWT token to a user', async () => {
            const result = await tokenService.attachToken(testUser);

            expect(result.error).toBe(false);
            expect(result.code).toBe(200);
            expect(result.data).toHaveProperty('token');
            expect(typeof result.data.token).toBe('string');
            expect(result.data.token.length).toBeGreaterThan(0);
        });

        it('should update user accessToken in database', async () => {
            const result = await tokenService.attachToken(testUser);

            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser?.accessToken).toBe(result.data.token);
        });

        it('should include user information in token payload', async () => {
            const result = await tokenService.attachToken(testUser);
            const token = result.data.token;

            // Decode token to verify payload (without verification)
            const jwt = require('jsonwebtoken');
            const decoded = jwt.decode(token);

            expect(decoded).toHaveProperty('id');
            expect(decoded).toHaveProperty('email');
            expect(decoded.email).toBe(testUser.email);
            expect(String(decoded.id)).toBe(String(testUser._id));
        });

        it('should handle token generation errors gracefully', async () => {
            // Create invalid user (missing required fields)
            const invalidUser = {
                _id: null,
                email: null,
            } as any;

            const result = await tokenService.attachToken(invalidUser);

            expect(result.error).toBe(true);
            expect(result.code).toBe(500);
        });
    });

    describe('refreshToken', () => {
        it('should refresh a valid token', async () => {
            // First attach a token
            const attachResult = await tokenService.attachToken(testUser);
            const originalToken = attachResult.data.token;

            // Refresh the token
            const refreshResult =
                await tokenService.refreshToken(originalToken);

            expect(refreshResult.error).toBe(false);
            expect(refreshResult.data).toHaveProperty('token');
        });

        it('should reject invalid tokens', async () => {
            const result = await tokenService.refreshToken('invalid-token');

            expect(result.error).toBe(true);
            expect(result.code).toBe(401);
        });

        it('should reject expired tokens', async () => {
            // Create an expired token
            const jwt = require('jsonwebtoken');
            const expiredToken = jwt.sign(
                { id: testUser._id, email: testUser.email },
                process.env.JWT_SECRET,
                { expiresIn: '-1h' },
            );

            const result = await tokenService.refreshToken(expiredToken);

            expect(result.error).toBe(true);
            expect(result.code).toBe(401);
        });

        it('should handle missing user in database', async () => {
            // Create token for non-existent user
            const jwt = require('jsonwebtoken');
            const fakeUserId = require('mongoose').Types.ObjectId();
            const fakeToken = jwt.sign(
                { id: fakeUserId, email: 'nonexistent@test.com' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
            );

            const result = await tokenService.refreshToken(fakeToken);

            expect(result.error).toBe(true);
            expect(result.code).toBe(404);
        });
    });
});
