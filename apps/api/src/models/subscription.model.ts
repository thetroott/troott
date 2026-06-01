import mongoose, { Model, Schema } from 'mongoose';
import ISubscriptionDoc, {
    BillingFrequency,
    Currency,
    SubscriptionStatus,
} from '@/interfaces/subscription.interface';
import { DbModels } from '@/types/common.enum';
import { debitCardSubSchema } from '@/models/shared-schemas';

const SubscriptionSchema = new Schema<ISubscriptionDoc>(
    {
        code: { type: String, required: true, unique: true, index: true },
        slug: { type: String, unique: true, sparse: true, index: true },

        status: {
            type: String,
            enum: Object.values(SubscriptionStatus),
            required: true,
            default: SubscriptionStatus.ACTIVE,
        },

        currency: {
            type: String,
            enum: Object.values(Currency),
            required: true,
        },

        billing: {
            retries: { type: Number, default: 0 },
            startAt: { type: Date, required: true },
            paidAt: { type: Date, required: true },
            dueAt: { type: Date, required: true },
            graceAt: { type: Date, required: true },
            amount: { type: Number, required: true },
            frequency: {
                type: String,
                enum: Object.values(BillingFrequency),
                required: true,
            },
            isPaid: { type: Boolean, default: false },
        },

        card: debitCardSubSchema,

        trial: {
            days: { type: Number, required: true },
            enabled: { type: Boolean, required: true },
        },

        listener: {
            type: Schema.Types.ObjectId,
            ref: DbModels.LISTENER,
            required: true,
            index: true,
        },

        plan: {
            type: Schema.Types.ObjectId,
            ref: DbModels.PLAN,
            required: true,
            index: true,
        },

        transactions: {
            type: [Schema.Types.ObjectId],
            ref: DbModels.TRANSACTION,
            index: true,
        },

        metadata: { type: Schema.Types.Mixed },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc, ret) {
                ret.id = ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    },
);

// // Middleware to set dynamic ref for subscriberId based on subscriberUserType
// SubscriptionSchema.pre(
//     'save' as any,
//     function (
//         this: mongoose.Document & ISubscriptionDoc,
//         next: (err?: mongoose.CallbackError) => void,
//     ) {
//         if (this.subscriberUserType === SubscriberUserType.TALENT) {
//             this.subscriberId = this.subscriberId;
//         }
//         next();
//     },
// );

const SubscriptionModel: Model<ISubscriptionDoc> =
    mongoose.model<ISubscriptionDoc>(DbModels.SUBSCRIPTION, SubscriptionSchema);

export default SubscriptionModel;
