import mongoose, { Model, Schema } from 'mongoose';
import {
    ISubscriptionIntentDoc,
    SubscriptionIntentState,
} from '@/interfaces/subscriptionIntent.interface';
import { BillingFrequency, Currency } from '@/interfaces/subscription.interface';
import { DbModels } from '@/types/common.enum';

const SubscriptionIntentSchema = new Schema<ISubscriptionIntentDoc>(
    {
        idempotencyKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        planId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: DbModels.PLAN,
        },

        currency: {
            type: String,
            enum: Object.values(Currency),
            required: true,
        },

        interval: {
            type: String,
            enum: Object.values(BillingFrequency),
            required: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: DbModels.USER,
            index: true,
        },

        state: {
            type: String,
            enum: Object.values(SubscriptionIntentState),
            default: SubscriptionIntentState.INITIATED,
        },

        subscriptionId: { type: String },

        transactionReference: { type: String },

        metaData: { type: Schema.Types.Mixed, default: {} },

        expiresAt: { type: Date, required: true },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc, ret: Record<string, unknown>) {
                return {
                    ...ret,
                    id: String(ret._id),
                };
            },
        },
    },
);

const SubscriptionIntent: Model<ISubscriptionIntentDoc> =
    mongoose.model<ISubscriptionIntentDoc>(
        DbModels.SUBSCRIPTION_INTENT,
        SubscriptionIntentSchema,
    );

export default SubscriptionIntent;
