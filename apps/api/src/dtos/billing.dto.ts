import { ObjectId } from 'mongoose';
import { BillingFrequency } from '../utils/enums.util';
import {
    IPaymentMethod,
    IPlanDoc,
    IUserDoc,
} from '../utils/interfaces.util';
import { IDebitCard } from '@/interfaces/subscription.interface';

export interface createPlanDto {}
export interface updatePlanDto {}
export interface createSubscriptionDto {
    userId: ObjectId;
    planId: ObjectId;
    paymentMethod: IPaymentMethod;
    frequency: BillingFrequency;
}

export interface renewSubscriptionDto {
    subscriptionId: ObjectId;
    paymentMethod: IPaymentMethod;
}

export interface cancelSubscriptionDto {
    subscriptionId: ObjectId;
    reason: string;
}

export interface changePlanDTO {
    subscriptionId: ObjectId;
    newPlanId: ObjectId;
    paymentMethod: IPaymentMethod;
}

export interface updatePaymentMethodDTO {
    subscriptionId: ObjectId;
    paymentMethod: IPaymentMethod;
}

export interface processTransactionDTO {
    userId: ObjectId;
    amount: number;
    paymentMethod: IPaymentMethod;
    planId?: ObjectId;
}

export interface verifyPaymentDTO {
    transactionId: string;
    paymentMethod: IPaymentMethod;
}
export interface updateSubscriptionDto {}


export interface VerifyCardDTO {
    user: IUserDoc;
    card: IDebitCard;
    reference: string;
}
