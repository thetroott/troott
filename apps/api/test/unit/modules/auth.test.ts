import { describe, it, beforeEach, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/configs/app.config';
import {
    createTestUser,
    createAdminUser,
    createTalentUser,
    expectSuccessResponse,
    expectErrorResponse,
    generateTestData,
} from '../../utils/test-helpers';
import { OtpType } from '../../../src/modules/user/user.interface';

describe('Auth Module - Integration Tests', () => {
    const baseUrl = '/api/v1/auth';
    let testUser: any;
    let adminUser: any;

    beforeEach(async () => {
        // Clear any existing test data
        testUser = null;
        adminUser = null;
    });

    describe('POST /auth/register', () => {
        it('should register a new talent user successfully', async () => {
            const userData = {
                email: generateTestData.email(),
                password: generateTestData.password(),
                userType: 'talent',
            };

            const response = await request(app)
                .post(`${baseUrl}/register`)
                .send(userData);

            // Debug: Log response if it fails
            if (response.body.error) {
                console.log(
                    'Error Response:',
                    JSON.stringify(response.body, null, 2),
                );
                console.log('Status:', response.status);
            }

            expectSuccessResponse(response);
            expect(response.body.data).toHaveProperty('email');
            expect(response.body.data.email).toBe(userData.email.toLowerCase());
            expect(response.body.message).toContain('OTP');
        });

        it('should register a new business user successfully', async () => {
            const userData = {
                email: generateTestData.email(),
                password: generateTestData.password(),
                userType: 'business',
            };

            const response = await request(app)
                .post(`${baseUrl}/register`)
                .send(userData);

            expectSuccessResponse(response);
            expect(response.body.data.email).toBe(userData.email.toLowerCase());
        });

        it('should reject registration with invalid email', async () => {
            const userData = {
                email: 'invalid-email',
                password: generateTestData.password(),
                userType: 'talent',
            };

            const response = await request(app)
                .post(`${baseUrl}/register`)
                .send(userData);

            expectErrorResponse(response, 400);
        });

        it('should reject registration with weak password', async () => {
            const userData = {
                email: generateTestData.email(),
                password: 'weak',
                userType: 'talent',
            };

            const response = await request(app)
                .post(`${baseUrl}/register`)
                .send(userData);

            expectErrorResponse(response, 400);
            expect(response.body.message).toContain('password');
        });

        it('should reject registration with missing fields', async () => {
            const response = await request(app)
                .post(`${baseUrl}/register`)
                .send({});

            expectErrorResponse(response, 400);
        });

        it('should reject duplicate email registration', async () => {
            const userData = {
                email: generateTestData.email(),
                password: generateTestData.password(),
                userType: 'talent',
            };

            // First registration
            await request(app).post(`${baseUrl}/register`).send(userData);

            // Duplicate registration
            const response = await request(app)
                .post(`${baseUrl}/register`)
                .send(userData);

            expectErrorResponse(response, 400);
            expect(response.body.message).toContain('already exist');
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            testUser = await createTalentUser();
        });

        it('should login user with valid credentials', async () => {
            const response = await request(app).post(`${baseUrl}/login`).send({
                email: testUser.user.email,
                password: 'Test@1234',
            });

            expectSuccessResponse(response);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('email');
            expect(response.body.data.email).toBe(testUser.user.email);
        });

        it('should reject login with invalid email', async () => {
            const response = await request(app).post(`${baseUrl}/login`).send({
                email: 'nonexistent@example.com',
                password: 'Test@1234',
            });

            expectErrorResponse(response, 400);
        });

        it('should reject login with invalid password', async () => {
            const response = await request(app).post(`${baseUrl}/login`).send({
                email: testUser.user.email,
                password: 'WrongPassword123!',
            });

            expectErrorResponse(response, 400);
        });

        it('should reject login with missing credentials', async () => {
            const response = await request(app)
                .post(`${baseUrl}/login`)
                .send({});

            expectErrorResponse(response, 400);
        });
    });

    describe('POST /auth/activate', () => {
        beforeEach(async () => {
            testUser = await createTalentUser();
            // Set OTP for activation
            testUser.user.Otp = '123456';
            testUser.user.OtpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
            testUser.user.otpType = OtpType.REGISTER;
            testUser.user.isActive = false;
            testUser.user.isActivated = false;
            await testUser.user.save();
        });

        it('should activate user account with valid OTP', async () => {
            const response = await request(app)
                .post(`${baseUrl}/activate`)
                .send({
                    email: testUser.user.email,
                    otp: '123456',
                    otpType: OtpType.REGISTER,
                });

            expectSuccessResponse(response);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.message).toContain('activated');
        });

        it('should reject activation with invalid OTP', async () => {
            const response = await request(app)
                .post(`${baseUrl}/activate`)
                .send({
                    email: testUser.user.email,
                    otp: '000000',
                    otpType: OtpType.REGISTER,
                });

            expectErrorResponse(response, 400);
        });

        it('should reject activation with expired OTP', async () => {
            // Set expired OTP
            testUser.user.OtpExpiry = Date.now() - 1000;
            await testUser.user.save();

            const response = await request(app)
                .post(`${baseUrl}/activate`)
                .send({
                    email: testUser.user.email,
                    otp: '123456',
                    otpType: OtpType.REGISTER,
                });

            expectErrorResponse(response, 400);
        });
    });

    describe('POST /auth/logout', () => {
        beforeEach(async () => {
            testUser = await createTestUser();
        });

        it('should logout authenticated user', async () => {
            const response = await request(app)
                .post(`${baseUrl}/logout`)
                .set('Authorization', `Bearer ${testUser.token}`)
                .send();

            expectSuccessResponse(response);
            expect(response.body.message).toContain('logged out');
        });

        it('should reject logout without authentication', async () => {
            const response = await request(app)
                .post(`${baseUrl}/logout`)
                .send();

            expectErrorResponse(response, 401);
        });
    });

    describe('POST /auth/forgot-password', () => {
        beforeEach(async () => {
            testUser = await createTalentUser();
        });

        it('should send password reset OTP', async () => {
            const response = await request(app)
                .post(`${baseUrl}/forgot-password`)
                .send({
                    email: testUser.user.email,
                });

            expectSuccessResponse(response);
            expect(response.body.message).toContain('OTP');
        });

        it('should reject with non-existent email', async () => {
            const response = await request(app)
                .post(`${baseUrl}/forgot-password`)
                .send({
                    email: 'nonexistent@example.com',
                });

            expectErrorResponse(response, 404);
        });
    });

    describe('POST /auth/reset-password', () => {
        beforeEach(async () => {
            testUser = await createTalentUser();
            // Set OTP for password reset
            testUser.user.Otp = '123456';
            testUser.user.OtpExpiry = Date.now() + 15 * 60 * 1000;
            testUser.user.otpType = OtpType.FORGOTPASSWORD;
            await testUser.user.save();
        });

        it('should reset password with valid OTP', async () => {
            // First verify OTP
            await request(app).post(`${baseUrl}/verify-otp`).send({
                email: testUser.user.email,
                otp: '123456',
                otpType: OtpType.FORGOTPASSWORD,
            });

            // Then reset password
            const response = await request(app)
                .post(`${baseUrl}/reset-password`)
                .send({
                    email: testUser.user.email,
                    newPassword: 'NewPassword@1234',
                });

            expectSuccessResponse(response);
            expect(response.body.message).toContain('reset');
        });

        it('should reject weak password', async () => {
            const response = await request(app)
                .post(`${baseUrl}/reset-password`)
                .send({
                    email: testUser.user.email,
                    newPassword: 'weak',
                });

            expectErrorResponse(response, 400);
        });
    });

    describe('POST /auth/change-password', () => {
        beforeEach(async () => {
            testUser = await createTestUser();
        });

        it('should change password with valid current password', async () => {
            const response = await request(app)
                .post(`${baseUrl}/change-password`)
                .set('Authorization', `Bearer ${testUser.token}`)
                .send({
                    currentPassword: 'Test@1234',
                    newPassword: 'NewPassword@1234',
                });

            expectSuccessResponse(response);
            expect(response.body.message).toContain('changed');
        });

        it('should reject with incorrect current password', async () => {
            const response = await request(app)
                .post(`${baseUrl}/change-password`)
                .set('Authorization', `Bearer ${testUser.token}`)
                .send({
                    currentPassword: 'WrongPassword@1234',
                    newPassword: 'NewPassword@1234',
                });

            expectErrorResponse(response, 400);
        });

        it('should reject without authentication', async () => {
            const response = await request(app)
                .post(`${baseUrl}/change-password`)
                .send({
                    currentPassword: 'Test@1234',
                    newPassword: 'NewPassword@1234',
                });

            expectErrorResponse(response, 401);
        });
    });
});
