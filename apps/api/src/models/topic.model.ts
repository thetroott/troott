import mongoose, { Schema, Model } from 'mongoose';
import type ITopicDoc from '@/interfaces/topic.interface';
import { DbModels } from '@/types/common.enum';

const TopicSchema = new Schema<ITopicDoc>(
    {
        code: { type: String, unique: true, sparse: true, index: true },
        name: { type: String, required: true, index: true },
        slug: { type: String, required: true, unique: true, index: true },
        description: { type: String },
        icon: { type: String },
        color: { type: String },

        parentTopic: { type: String },

        usageCount: { type: Number, default: 0 },
        trendingScore: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true, index: true },

        createdBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
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

TopicSchema.index({ name: 'text', description: 'text' });

const Topic: Model<ITopicDoc> = mongoose.model<ITopicDoc>(
    DbModels.TOPIC,
    TopicSchema,
);

export default Topic;
