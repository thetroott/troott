import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a single permission (action grant).
 *
 * Permissions are referenced by {@link IRoleDoc} to build composable
 * RBAC policies. Each permission maps to exactly one controller action
 * (e.g. `sermon:publish`, `admin:create`).
 */
interface IPermissionDoc extends Document {
    /** Machine-readable action identifier (e.g. `sermon:publish`). */
    action: string;
    /** Human-readable explanation of what this permission allows. */
    description: string;

    /** When the permission was created. */
    createdAt: Date;
    /** When the permission was last updated. */
    updatedAt: Date;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

export type { IPermissionDoc };
export default IPermissionDoc;
