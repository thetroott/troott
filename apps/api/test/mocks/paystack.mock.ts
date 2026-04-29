/**
 * Mock for Paystack payment service
 * Prevents actual payment processing during tests
 *
 * Note: Paystack service exports named functions, not a default object
 */

import { jest } from '@jest/globals';
import {
    initializePaymentDTO,
    CreatePlanDTO,
    verifWebhookDTO,
} from '../../src/modules/paystack/paystack.interface';

// Mock the named exports from paystack.service.ts
export const initializePayment = jest
    .fn<(dto: initializePaymentDTO) => Promise<any>>()
    .mockResolvedValue({
        status: true,
        message: 'Authorization URL created',
        data: {
            authorization_url: 'https://paystack.com/pay/test-reference',
            access_code: 'test-access-code',
            reference: 'test-reference-123',
        },
    });

export const verifyTransaction = jest
    .fn<(reference: string) => Promise<any>>()
    .mockResolvedValue({
        status: true,
        message: 'Verification successful',
        data: {
            status: 'success',
            reference: 'test-reference-123',
            amount: 10000,
            currency: 'NGN',
            customer: {
                email: 'test@example.com',
            },
        },
    });

export const paystackCreatePlan = jest
    .fn<(dto: CreatePlanDTO) => Promise<any>>()
    .mockResolvedValue({
        status: true,
        message: 'Plan created successfully',
        data: {
            plan_code: 'PLN_test123',
            name: 'Test Plan',
            amount: 10000,
        },
    });

export const paystackPlanUpdate = jest
    .fn<(planCode: string, updateData: CreatePlanDTO) => Promise<any>>()
    .mockResolvedValue({
        status: true,
        message: 'Plan updated successfully',
        data: {
            plan_code: 'PLN_test123',
            name: 'Updated Plan',
        },
    });

export const verifyWebhookSignature = jest
    .fn<(dto: verifWebhookDTO) => boolean>()
    .mockReturnValue(true);

// Default export for backward compatibility (if needed)
const paystackServiceMock = {
    initializePayment,
    verifyTransaction,
    paystackCreatePlan,
    paystackPlanUpdate,
    verifyWebhookSignature,
};

export default paystackServiceMock;
