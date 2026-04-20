import mongoose, { Model, Schema } from 'mongoose';
import { IPlanDoc, PlanType } from './plan.interface';
import { DbModels } from '../../../utils/enums.util';

const PlanSchema = new Schema<IPlanDoc>(
    {
        code: { type: String, required: true, unique: true, index: true },
        label: { type: String, required: true },
        planType: {
            type: String,
            required: true,
            enum: Object.values(PlanType),
        },
        name: { type: String, required: true },
        displayName: { type: String, required: true },
        isEnabled: { type: Boolean, default: true },
        description: { type: String },

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

        members: {
            limit: { type: Number, required: true },
            frequency: { type: String, required: true },
        },
        domains: {
            limit: { type: Number, required: true },
            frequency: { type: String, required: true },
        },
        projects: {
            limit: { type: Number, required: true },
            frequency: { type: String, required: true },
        },

        slug: { type: String, required: true, unique: true, index: true },

        paystackPlanCodes: {
            nairaMonthly: { type: String },
            nairaYearly: { type: String },
            dollarMonthly: { type: String },
            dollarYearly: { type: String },
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
