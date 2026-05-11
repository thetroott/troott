import mongoose, { Schema, Model } from 'mongoose';
import ITransactionDoc, {
    TransactionType,
    TransactionStatus,
    TransactionLabel,
} from '@/interfaces/transaction.interface';
import { DbModels } from '@/types/common.enum';
import { decrypt, encrypt } from '../utils/encryption.util';

const TransactionSchema = new Schema<ITransactionDoc>(
    {
        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: true,
            index: true,
        },
        label: { type: String, index: true },
        resource: { type: String, required: true, index: true },
        reference: { type: String, unique: true, required: true },
        currency: { type: String, required: true, index: true },
        providerRef: { type: String },
        providerName: { type: String },
        description: { type: String },
        narration: { type: String },
        amount: { type: Number, required: true },
        unitAmount: { type: Number, required: true },
        fee: { type: Number, required: true },
        unitFee: { type: Number, required: true },
        status: {
            type: String,
            enum: Object.values(TransactionStatus),
            required: true,
            index: true,
        },
        reason: { type: String },
        message: { type: String },
        providerData: [{ type: Schema.Types.Mixed }],
        channel: { type: String },
        slug: { type: String, unique: true, required: true },
        card: {
            authCode: { type: String, select: false, required: true },
            cardBin: { type: String },
            cardLast: { type: String },
            expiryMonth: { type: String },
            expiryYear: { type: String },
            cardPan: { type: String, select: false, required: true },
            token: { type: String },
            provider: { type: String },
        },
        policed: { type: Number },

        talent: {
            type: Schema.Types.ObjectId,
            ref: DbModels.LISTENER,
            index: true,
        },
        subscription: {
            type: Schema.Types.ObjectId,
            ref: DbModels.SUBSCRIPTION,
            index: true,
        },

        completedAt: { type: String },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc: any, ret) {
                ret.id = ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    },
);

TransactionSchema.pre<ITransactionDoc>('save', function (next) {
    if (this.card?.authCode) {
        this.card.authCode = encrypt(this.card.authCode);
    }
    if (this.card?.cardPan) {
        this.card.cardPan = encrypt(this.card.cardPan);
    }
    next();
});

TransactionSchema.methods.decryptCardDetails = function () {
    if (this.card) {
        return {
            ...this.card,
            authCode: decrypt(this.card.authCode),
            cardPan: decrypt(this.card.cardPan),
        };
    }
    return this.card;
};

const Transaction: Model<ITransactionDoc> = mongoose.model<ITransactionDoc>(
    DbModels.TRANSACTION,
    TransactionSchema,
);

export default Transaction;
