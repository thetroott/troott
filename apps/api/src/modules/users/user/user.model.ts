import mongoose, { Schema, Model } from 'mongoose';
import {
    IUserDoc,
    InviteStatus,
    OnboardStatus,
    OtpType,
    PasswordType,
    UserType,
} from './user.interface';
import { DbModels } from '../../../utils/enums.util';
import authService from '../../authentication/auth/auth.service';

const UserSchema = new Schema<IUserDoc>(
    {
        code: { type: String, unique: true, index: true, sparse: true },
        firstName: { type: String },
        lastName: { type: String },
        slug: { type: String, lowercase: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        password: { type: String, select: false },
        passwordType: {
            type: String,
            enum: Object.values(PasswordType),
            default: PasswordType.SYSTEMGENERATED,
        },
        userType: {
            type: String,
            enum: Object.values(UserType),
            default: UserType.USER,
        },

        // Media Fields
        avatar: {
            fileName: { type: String },
            s3Key: { type: String },
        },
        coverImage: {
            fileName: { type: String },
            s3Key: { type: String },
        },

        // Location & Time
        location: {
            phoneCode: { type: String },
            phoneNumber: { type: String },
            address: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String },
            postalCode: { type: String },
        },
        timeZone: { type: String, default: 'UTC' },

        // Auth & Session
        login: {
            last: { type: String },
            method: { type: String },
        },
        onboard: {
            step: { type: Number, default: 1 },
            status: {
                type: String,
                enum: Object.values(OnboardStatus),
                default: OnboardStatus.NOT_STARTED,
            },
        },
        inviteStatus: {
            type: String,
            enum: Object.values(InviteStatus),
            default: InviteStatus.PENDING,
        },

        // Security & Tokens
        Otp: { type: String },
        OtpExpiry: { type: Number },
        otpType: { type: String, enum: Object.values(OtpType) },
        accessToken: { type: String },
        accessTokenExpiry: { type: Date },
        tokenVersion: { type: Number, default: 0 },

        // Role Flags
        isSuper: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        isBusiness: { type: Boolean, default: false },
        isTalent: { type: Boolean, default: false },
        isUser: { type: Boolean, default: true },

        // Status Flags
        isActivated: { type: Boolean, default: false },
        isDeactivated: { type: Boolean, default: false },
        isSuspended: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
        isLocked: { type: Boolean, default: false },
        loginLimit: { type: Number, default: 5 },
        lockedUntil: { type: Date, default: null },
        twoFactorEnabled: { type: Boolean, default: false },

        // Devices
        devices: [{ type: Schema.Types.Mixed }],

        // Relationships
        roles: [
            {
                type: Schema.Types.ObjectId,
                ref: DbModels.ROLE,
            },
        ],
        permissions: [
            {
                type: Schema.Types.ObjectId,
                ref: DbModels.PERMISSION,
            },
        ],
        notifications: [
            {
                type: Schema.Types.ObjectId,
                ref: DbModels.NOTIFICATION,
            },
        ],
        keys: [
            {
                type: Schema.Types.ObjectId,
                ref: DbModels.APIKEY,
            },
        ],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
        },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(doc: any, ret) {
                ret.id = ret._id;
                if ('_v' in ret) delete (ret as any)._v;
            },
        },
    },
);

// Password Encryption Hook
UserSchema.pre('save', async function (next) {
    // if (!this.isModified('password')) return next();
    // await authService.encryptUserPassword(this, this.password);
    // next();
});

// Instance Methods (Make sure these match your interface)
UserSchema.methods.matchPassword = async function (password: string) {
    // Logic usually handled via authService or bcrypt
    return true;
};

const User: Model<IUserDoc> = mongoose.model<IUserDoc>(
    DbModels.USER,
    UserSchema,
);

export default User;
