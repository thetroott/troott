import { describe, it, beforeEach, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/configs/app.config';
import {
    createTestUser,
    createAdminUser,
    expectSuccessResponse,
    expectErrorResponse,
    generateTestData,
} from '../../utils/test-helpers';
import { UserType } from '../../../src/modules/user/user.interface';

describe('User Module - Integration Tests', () => {
    const baseUrl = '/api/v1/user';
    let testUser: any;
    let adminUser: any;

    beforeEach(async () => {
        testUser = await createTestUser();
        adminUser = await createAdminUser();
    });

    describe('GET /user/profile', () => {
        it('should get user profile when authenticated', async () => {
            const response = await request(app)
                .get(`${baseUrl}/profile`)
                .set('Authorization', `Bearer ${testUser.token}`);

            expectSuccessResponse(response);
            expect(response.body.data).toHaveProperty('email');
            expect(response.body.data.email).toBe(testUser.user.email);
        });

        it('should reject without authentication', async () => {
            const response = await request(app).get(`${baseUrl}/profile`);

            expectErrorResponse(response, 401);
        });
    });

    describe('PUT /user/profile', () => {
        it('should update user profile when authenticated', async () => {
            const updateData = {
                name: generateTestData.name(),
            };

            const response = await request(app)
                .put(`${baseUrl}/profile`)
                .set('Authorization', `Bearer ${testUser.token}`)
                .send(updateData);

            expectSuccessResponse(response);
        });

        it('should reject without authentication', async () => {
            const response = await request(app)
                .put(`${baseUrl}/profile`)
                .send({ name: generateTestData.name() });

            expectErrorResponse(response, 401);
        });
    });
});
