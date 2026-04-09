import mongoose, { Schema, Types, Model, ObjectId } from "mongoose";
import { IRoleDoc } from "./role.interface";
import { genSlug } from "../../../utils/helpers.util";
import { DbModels } from "../../../utils/enums.util";
import { UserType } from "../../users/user/user.interface";
    import { format } from "node:path";

const RoleSchema = new mongoose.Schema<IRoleDoc>(
  {
    name: {
      type: String,
      required: [true, "please add a role name"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "please add a role description"],
      maxlength: [400, "role description cannot be more than 400 characters"],
    },
    slug: { type: String, default: "" },

    permissions: [{ type: String, ref: DbModels.PERMISSION }],
    users: [
      {
        type: Schema.Types.Mixed,
        ref: DbModels.USER,
      },
    ],
  },
 {
    timestamps: true,
    versionKey: "_version",
    toJSON: { 
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);


RoleSchema.set("toJSON", { virtuals: true, getters: true });

(RoleSchema as any).pre("save", async function (this: IRoleDoc) {
  this.slug = genSlug(this.name);
});

(RoleSchema as any).pre("insertMany", async function (docs: any[]) {
  if (Array.isArray(docs)) {
    docs.forEach((doc: any) => {
      if (doc && !doc.slug && doc.name) {
        doc.slug = genSlug(doc.name);
      }
    });
  }
});

RoleSchema.methods.getAll = async () => {
  return await Role.find({});
};

RoleSchema.methods.findByName = async (name: string) => {
  const role = await Role.findOne({ name: name });
  return role ? role : null;
};

const Role: Model<IRoleDoc> = mongoose.model<IRoleDoc>(
  DbModels.ROLE,
  RoleSchema
);
export default Role;
