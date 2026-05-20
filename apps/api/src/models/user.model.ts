import mongoose, { Schema, Model } from 'mongoose';
import IUserDoc, {
    InviteStatus,
    LoginMethod,
    OnboardStatus,
    OtpType,
    PasswordType,
    UserType,
} from '@/interfaces/user.interface';
import { DbModels } from '@/types/common.enum';
import authService from '@/services/auth.service';

const UserSchema = new Schema<IUserDoc>(
    {
        code: { type: String, unique: true, index: true, sparse: true },
        firstName: { type: String },
        lastName: { type: String },
        middleName: { type: String },
        gender: { type: String },
        dateOfBirth: { type: Date },
        phoneNumber: { type: String },
        phoneCode: { type: String },
        countryPhone: { type: String },
        country: { type: Schema.Types.Mixed },
        homeCountry: { type: Schema.Types.Mixed },
        location: {
            address: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String },
            postalCode: { type: String },
        },

        avatar: {
            fileName: { type: String },
            s3Key: { type: String },
        },
        banner: {
            fileName: { type: String },
            s3Key: { type: String },
        },

        slug: { type: String, lowercase: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        altPhone: { type: String },
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

        Otp: { type: String },
        OtpExpiry: { type: Number },
        otpType: { type: String, enum: Object.values(OtpType) },
        accessToken: { type: String },
        accessTokenExpiry: { type: Date },
        tokenVersion: { type: Number, default: 0 },

        login: {
            last: { type: String },
            method: {
                type: String,
                enum: Object.values(LoginMethod),
            },
        },
        onboard: {
            step: { type: Number, default: 1 },
            stage: { type: String },
            status: {
                type: String,
                enum: Object.values(OnboardStatus),
                default: OnboardStatus.NOT_STARTED,
            },
        },
        status: {
            profile: { type: String },
        },
        inviteStatus: {
            type: String,
            enum: Object.values(InviteStatus),
            default: InviteStatus.PENDING,
        },

        apiKey: { type: Schema.Types.Mixed },

        isSuper: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        isUser: { type: Boolean, default: true },
        isListener: { type: Boolean, default: false },
        isMinister: { type: Boolean, default: false },
        isCreator: { type: Boolean, default: false },

        isActivated: { type: Boolean, default: false },
        isDeactivated: { type: Boolean, default: false },
        isSuspended: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
        loginLimit: { type: Number, default: 5 },
        isLocked: { type: Boolean, default: false },
        lockedUntil: { type: Date, default: null },
        twoFactorEnabled: { type: Boolean, default: false },

        followers: [{ type: Schema.Types.ObjectId, ref: DbModels.USER }],
        followings: [{ type: Schema.Types.ObjectId, ref: DbModels.USER }],

        googleId: { type: String },
        appleId: { type: String },
        githubId: { type: String },

        roles: [{ type: Schema.Types.ObjectId, ref: DbModels.ROLE }],
        permissions: [{ type: Schema.Types.ObjectId, ref: DbModels.PERMISSION }],
        verification: { type: Schema.Types.Mixed },
        notifications: [{ type: Schema.Types.Mixed }],
        devices: [{ type: Schema.Types.Mixed }],
        listener: { type: Schema.Types.ObjectId, ref: DbModels.LISTENER },
        minister: { type: Schema.Types.ObjectId, ref: DbModels.MINISTER },
        primaryStudio: {
            type: Schema.Types.ObjectId,
            ref: DbModels.STUDIO,
            index: true,
        },
        keys: [{ type: Schema.Types.Mixed }],
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

UserSchema.pre('save', async function (next) {
    // if (!this.isModified('password')) return next();
    // await authService.encryptUserPassword(this, this.password);
    // next();
});

UserSchema.methods.matchPassword = async function (password: string) {
    return true;
};

const User: Model<IUserDoc> = mongoose.model<IUserDoc>(
    DbModels.USER,
    UserSchema,
);

export default User;
