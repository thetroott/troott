import mongoose, { Schema, Model } from 'mongoose';
import {
    IAdminDoc,
    AdminDepartmentEnum,
    AdminTypeEnum,
    CompanyRoleEnum,
} from './admin.interface';
import { DbModels } from '../../../utils/enums.util';

/**
 * Admin Schema
 */
const AdminSchema = new Schema<IAdminDoc>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        firstName: { type: String, required: true },
        lastName: { type: String, required: true },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            index: true,
        },

        adminType: {
            type: String,
            enum: Object.values(AdminTypeEnum),
            required: true,
            index: true,
        },
        department: {
            type: String,
            enum: Object.values(AdminDepartmentEnum),
            required: true,
            index: true,
        },
        position: {
            type: String,
            enum: Object.values(CompanyRoleEnum),
            required: true,
        },

        accessLevel: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.ADMIN,
        },

        settings: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
        },

        /**
         * Relationships
         */
        user: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
        },
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

const Admin: Model<IAdminDoc> = mongoose.model<IAdminDoc>(
    DbModels.ADMIN,
    AdminSchema,
);

export default Admin;
