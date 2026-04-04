import mongoose, { Schema, Model } from "mongoose";
import { IAdminDoc } from "../utils/interfaces.util";
import {
  DbModels,
  VerificationStatus,
  StaffUnit,
  AdminRole,
} from "../utils/enums.util";
import { decrypt, encrypt } from "../utils/encryption.util";

const AdminSchema = new Schema<IAdminDoc>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },

    phoneNumber: { type: String, unique: true},
    phoneCode: { type: String, default: "+234" },
    country: { type: String },
    countryPhone: { type: String},
    avatar: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String },
    slug: { type: String, unique: true },

    // Staff Role & Access
    unit: {
      type: String,
      enum: Object.values(StaffUnit),
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      index: true,
    },
    accessLevel: { type: Number, required: true },

    // API & Security
    apiKeys: [
      {
        key: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        lastUsed: { type: Date },
      },
    ],
    ipWhitelist: [{ type: String }],
    
    // Actions & Moderation
    actionsTaken: [
      {
        action: { type: String, required: true },
        targetId: { type: Schema.Types.ObjectId, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    
    // Uploads & Publications
    uploads: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
    uploadHistory: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
    publishedCount: { type: Number, default: 0 },

    // Security & Verification
    identification: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    
    // Relationships
    user: { type: Schema.Types.ObjectId, ref: DbModels.USER },
    createdBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
    settings: { type: Schema.Types.ObjectId, ref: DbModels.USER },
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


AdminSchema.set("toJSON", { virtuals: true, getters: true });

AdminSchema.pre("save", function (next) {
  if (this.isModified("apiKeys")) {
    this.apiKeys = this.apiKeys.map((apiKey) => ({
      ...apiKey,
      key: encrypt(apiKey.key),
    }));
  }
  next();
});

AdminSchema.methods.decryptApiKeys = function () {
  if (this.apiKeys) {
    return this.apiKeys.map((apiKey: any) => ({
      ...apiKey,
      key: decrypt(apiKey.key),
    }));
  }
  return this.apiKeys;
};

const Staff: Model<IAdminDoc> = mongoose.model<IAdminDoc>(
  DbModels.ADMIN,
  AdminSchema
);

export default Staff;
