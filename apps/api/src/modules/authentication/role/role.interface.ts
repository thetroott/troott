import { Document, Types } from "mongoose";


type ObjectId = Types.ObjectId;

export interface IRoleDoc extends Document {
  name: string;
  description: string;
  slug: string;
  
  // Permission configuration
  permissions: Array<string>;

  // Relationships
  users: Array<ObjectId | any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}