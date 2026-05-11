import mongoose, { Model, Schema } from 'mongoose';
import ISubscriptionDoc, {
    BillingFrequency,
    Currency,
    SubscriptionStatus,
} from '@/interfaces/subscription.interface';
import { DbModels } from '@/types/common.enum';

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
            startAt: { type: Date },
            paidAt: { type: Date },
            dueAt: { type: Date },
            graceAt: { type: Date },
            amount: { type: Number, required: true },
            frequency: {
                type: String,
                enum: Object.values(BillingFrequency),
                required: true,
            },
            isPaid: { type: Boolean, default: false },
        },

        card: {
            authCode: { type: String, select: false },
            cardBin: { type: String },
            cardLast: { type: String },
            expiryMonth: { type: String },
            expiryYear: { type: String },
            cardPan: { type: String, select: false },
        },

        trial: {
            days: { type: Number },
            enabled: { type: Boolean },
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
