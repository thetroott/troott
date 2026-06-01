import mongoose, { Schema, Model } from 'mongoose';
import type IRecommendationDoc from '@/interfaces/core/recommendation.interface';
import {
    RecommendationTargetType,
    RecommendationReason,
    RecommendationReasonType,
    RecommendationCandidateSource,
    RecommendationAlgorithm,
    RecommendationSection,
    TimeOfDay,
} from '@/interfaces/core/recommendation.interface';
import { DbModels } from '@/types/common.enum';
import {
    DeviceType,
    NetworkType,
} from '@/interfaces/core/playback.interface';

const ReasonMetadataSchema = new Schema(
    {
        topicName: { type: String },
        topicId: { type: String },
        ministerName: { type: String },
        ministerId: { type: String },
        regionName: { type: String },
        languageCode: { type: String },
        seriesTitle: { type: String },
        seriesId: { type: String },
        label: { type: String },
    },
    { _id: false },
);

const FeedbackSchema = new Schema(
    {
        impressionCount: { type: Number, default: 0 },
        clickedAt: { type: Date, default: null },
        dismissed: { type: Boolean, default: false },
        played: { type: Boolean, default: false },
        playbackCompletionRate: { type: Number, default: 0 },
        skipped: { type: Boolean, default: false },
        skippedAt: { type: Date, default: null },
        savedToLibrary: { type: Boolean, default: false },
        shareCount: { type: Number, default: 0 },
        likeSignal: { type: Boolean, default: false },
    },
    { _id: false },
);

const ContextSchema = new Schema(
    {
        timeOfDay: {
            type: String,
            enum: Object.values(TimeOfDay),
            default: TimeOfDay.MORNING,
        },
        deviceType: {
            type: String,
            enum: [...Object.values(DeviceType), 'unknown'],
            default: 'unknown',
        },
        networkType: {
            type: String,
            enum: [...Object.values(NetworkType), 'unknown'],
            default: 'unknown',
        },
    },
    { _id: false },
);

const RecommendationSchema = new Schema<IRecommendationDoc>(
    {
        code: { type: String, unique: true, sparse: true, index: true },

        listener: {
            type: Schema.Types.ObjectId,
            ref: DbModels.LISTENER,
            default: null,
            index: true,
        },

        targetType: {
            type: String,
            enum: Object.values(RecommendationTargetType),
            required: true,
        },
        targetId: { type: String, required: true },

        reason: {
            type: String,
            enum: Object.values(RecommendationReason),
            required: true,
        },
        reasonType: {
            type: String,
            enum: Object.values(RecommendationReasonType),
            required: true,
        },
        reasonMetadata: { type: ReasonMetadataSchema, default: () => ({}) },

        candidateSource: {
            type: String,
            enum: Object.values(RecommendationCandidateSource),
            required: true,
        },

        basedOnTopics: [
            { type: Schema.Types.ObjectId, ref: DbModels.TOPIC },
        ],
        basedOnMinisters: [
            { type: Schema.Types.ObjectId, ref: DbModels.MINISTER },
        ],
        basedOnSermons: [
            { type: Schema.Types.ObjectId, ref: DbModels.SERMON },
        ],

        score: { type: Number, default: 0 },
        confidence: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
        position: { type: Number, default: 0 },

        freshnessScore: { type: Number, default: 1.0 },
        decayRate: { type: Number, default: 0.05 },

        embeddingVector: { type: [Number], default: undefined },
        similarityScore: { type: Number },

        section: {
            type: String,
            enum: Object.values(RecommendationSection),
            required: true,
            index: true,
        },

        algorithm: {
            type: String,
            enum: Object.values(RecommendationAlgorithm),
            required: true,
        },
        modelVersion: { type: String, default: '1.0.0' },
        experimentId: { type: String },
        variantId: { type: String },

        context: { type: ContextSchema, default: () => ({}) },

        generatedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        isActive: { type: Boolean, default: true, index: true },
        version: { type: Number, default: 1 },

        feedback: {
            type: FeedbackSchema,
            default: () => ({
                impressionCount: 0,
                clickedAt: null,
                dismissed: false,
                played: false,
                playbackCompletionRate: 0,
                skipped: false,
                skippedAt: null,
                savedToLibrary: false,
                shareCount: 0,
                likeSignal: false,
            }),
        },

        listenerCountry: { type: String, default: '' },
        contentLanguage: { type: String, default: '' },
        contentTopics: [{ type: String }],
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

RecommendationSchema.index(
    { listener: 1, section: 1, score: -1 },
    { name: 'listener_section_score' },
);
RecommendationSchema.index(
    { listener: 1, targetType: 1, targetId: 1 },
    { unique: true, name: 'listener_target_dedup' },
);
RecommendationSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: 'ttl_cleanup' },
);

const Recommendation: Model<IRecommendationDoc> =
    mongoose.model<IRecommendationDoc>(
        DbModels.RECOMMENDATION,
        RecommendationSchema,
    );

export default Recommendation;
