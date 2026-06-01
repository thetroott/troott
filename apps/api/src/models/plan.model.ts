import mongoose, { Model, Schema } from 'mongoose';
import IPlanDoc, { PlanType } from '@/interfaces/plan.interface';
import { DbModels } from '@/types/common.enum';
import { FREE_PLAN_PAYSTACK_CODES } from '@/constants/plan.constants';

const PlanSchema = new Schema<IPlanDoc>(
    {
        code: { type: String, required: true, unique: true, index: true },
        slug: { type: String, required: true, unique: true, index: true },

        label: { type: String, required: true },
        planType: {
            type: String,
            required: true,
            enum: Object.values(PlanType),
        },
        name: { type: String, required: true },
        displayName: { type: String, required: true },
        isEnabled: { type: Boolean, default: true },
        description: { type: String, required: true },

        trial: {
            days: { type: Number, required: true },
            enabled: { type: Boolean, required: true },
        },
        pricing: {
            naira: {
                monthly: { type: Number, required: true },
                yearly: { type: Number, required: true },
            },
            dollar: {
                monthly: { type: Number, required: true },
                yearly: { type: Number, required: true },
            },
        },

        sermon: {
            limit: { type: Number, required: true },
            frequency: { type: String, required: true },
        },
        sermonBite: {
            limit: { type: Number, required: true },
            frequency: { type: String, required: true },
        },

        paystackPlanCodes: {
            nairaMonthly: {
                type: String,
                required: true,
                default: FREE_PLAN_PAYSTACK_CODES.nairaMonthly,
            },
            nairaYearly: {
                type: String,
                required: true,
                default: FREE_PLAN_PAYSTACK_CODES.nairaYearly,
            },
            dollarMonthly: {
                type: String,
                required: true,
                default: FREE_PLAN_PAYSTACK_CODES.dollarMonthly,
            },
            dollarYearly: {
                type: String,
                required: true,
                default: FREE_PLAN_PAYSTACK_CODES.dollarYearly,
            },
        },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc, ret) {
                return {
                    ...ret,
                    id: ret._id.toString(),
                };
            },
        },
    },
);

const Plan: Model<IPlanDoc> = mongoose.model<IPlanDoc>(
    DbModels.PLAN,
    PlanSchema,
);

export default Plan;
