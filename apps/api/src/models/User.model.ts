import mongoose, { Schema, Model } from "mongoose";
import { IUserDoc } from "../utils/interfaces.util";
import {
  DbModels,
  OtpType,
  PasswordType,
  UserType,
} from "../utils/enums.util";
import userService from "../services/auth.service";

const UserSchema = new Schema<IUserDoc>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true, default: "", select: false },
    passwordType: {
      type: String,
      enum: Object.values(PasswordType),
      default: PasswordType.USERGENERATED,
    },
    userType: {
      type: String,
      enum: Object.values(UserType),
    },
    phoneNumber: { type: String },
    phoneCode: { type: String, default: "+234" },
    country: { type: String },
    countryPhone: { type: String },

    avatar: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String },
    location: {
      address: String,
      city: String,
      state: String,
    },

    Otp: { type: String },
    OtpExpiry: {
      type: Number,
    },
    otpType: { type: String, enum: Object.values(OtpType) },
    accessToken: { type: String },
    accessTokenExpiry: { type: Date },
    tokenVersion: { type: Number, default: 0 },

    isSuper: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    isMinister: { type: Boolean, default: false },
    isCreator: { type: Boolean, default: false },
    isListener: { type: Boolean, default: false },

    isActivated: { type: Boolean, default: false },
    isDeactivated: { type: Boolean, default: false },

    loginInfo: {
      ip: String,
      deviceType: String,
      platform: {
        type: String,
        enum: ["web", "mobile", "tablet"],
      },
      deviceInfo: {
        manufacturer: String,
        model: String,
        osName: String,
        osVersion: String,
        browser: String,
        browserVersion: String,
        appVersion: String,
      },
      location: {
        country: String,
        city: String,
        timezone: String,
      },
    },

    lastLogin: { type: String },
    isActive: { type: Boolean, default: false },
    loginLimit: { type: Number, default: 5 },
    isLocked: { type: Boolean, default: false },
    lockedUntil: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },

    // Relationships
    roles: [{ type: Schema.Types.ObjectId, ref: DbModels.ROLE, index: true }],
    role: { type: Schema.Types.ObjectId, ref: DbModels.ROLE },
    googleId: { type: String },
    appleId: { type: String },

    preferences: {
      topics: [{ type: String }],
      ministers: [{ type: Schema.Types.ObjectId, ref: DbModels.MINISTER }],
    },

    // Notification Preferences
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },

    uploadImage: {
      fileName: { type: String },
      fileSize: { type: Number },
      fileType: { type: String },
      mimetype: { type: String },
      uploadedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
      uploadStatus: { type: String },
      uploadId: { type: String },
      s3Key: { type: String },
      rawFile: { type: String },
    },
  },
  {
    timestamps: true,
    versionKey: "_version",
   toJSON: {
  transform(doc, ret) {
    ret.id = ret._id;
    if ('__v' in ret) delete (ret as any).__v;
  },
},

  }
);

UserSchema.set("toJSON", { virtuals: true, getters: true });

UserSchema.pre<IUserDoc>("save", async function (next) {
  if (!this.isModified("password")) return next();
  await userService.encryptUserPassword(this, this.password);
  next();
});

UserSchema.pre<IUserDoc>("insertMany", async function (next) {
  next();
});

const User: Model<IUserDoc> = mongoose.model<IUserDoc>(
  DbModels.USER,
  UserSchema
);

export default User;
