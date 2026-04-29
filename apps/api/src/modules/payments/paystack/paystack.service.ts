import Paystack from 'paystack-sdk';
import crypto from 'crypto';
import {
    CreatePlanDTO,
    initializePaymentDTO,
    verifWebhookDTO,
} from './paystack.interface';
import dotenv from 'dotenv';
import { RequestHandler } from 'express';
dotenv.config();

const secretKey = process.env.PAYSTACK_SECRET_KEY;

if (!secretKey) {
    throw new Error('Paystack secret key not set');
}

const paystack = new Paystack(secretKey);

/**
 * Initialize a Paystack transaction.
 * Does NOT confirm payment.
 */
export const initializePayment = async (
    dto: initializePaymentDTO,
): Promise<any> => {
    try {
        const response = await paystack.transaction.initialize({
            email: dto.email,
            amount: dto.amount,
            plan: dto.plan,
            callback_url: dto.callback_url,
        });
        return response;
    } catch (err) {
        console.log(err);
        /**
         * if (!response?.status) {
        throw new Error('Failed to initialize Paystack transaction');
    }

    return response.data;
         */
    }
};

/**
 * Verify a Paystack transaction by reference.
 */
export const verifyTransaction = async (reference: string): Promise<any> => {
    try {
        const response = await paystack.transaction.verify(reference);
        return response;
    } catch (err) {
        console.log(err);
    }
};

// Plan

/**
 * Create a Paystack subscription plan.
 */
export const paystackCreatePlan = async (dto: CreatePlanDTO): Promise<any> => {
    try {
        const response = await paystack.plan.create({
            name: dto.name,
            amount: dto.amount,
            interval: dto.interval,
            description: dto.description,
        });

        return response;
    } catch (err) {
        console.log(err);
    }
};

/**
 * Update a Paystack subscription plan.
 */
export const paystackPlanUpdate = async (
    planCode: string,
    updateData: CreatePlanDTO,
): Promise<any> => {
    try {
        const response = await paystack.plan.update(planCode, updateData);

        return response;
    } catch (error) {}
};

// export const fetchPlan = async () => {};

// Webhooks

/**
 * Verify Paystack webhook signature.
 *
 * IMPORTANT:
 * `payload` MUST be the raw request body (Buffer or string).
 */
export const verifyWebhookSignature = (dto: verifWebhookDTO): boolean => {
    const { paystackSecret, signature, payload } = dto;

    const hash = crypto
        .createHmac('sha512', paystackSecret)
        .update(payload)
        .digest('hex');
    return hash === signature;
};

/**
 * import express from 'express';

const app = express();

raw body ONLY for Paystack route

// Normal JSON for everything else
app.use(express.json());

// RAW body for Paystack webhook
app.post(
  '/webhooks/paystack',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature = req.headers['x-paystack-signature'] as string;
    const rawBody = req.body; // Buffer

    // verify HMAC here
    // crypto.createHmac(...).update(rawBody)

    res.sendStatus(200);
  },
);

 */
