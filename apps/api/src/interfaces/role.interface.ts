import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for a role in the RBAC system.
 *
 * Roles group {@link IPermissionDoc} actions into named bundles
 * (e.g. `admin`, `moderator`, `listener`) that are then assigned
 * to users via {@link IUserDoc.roles}.
 */
interface IRoleDoc extends Document {
    /** Display name of the role (e.g. `Content Moderator`). */
    name: string;
    /** Human-readable explanation of the role's purpose. */
    description: string;
    /** URL-safe slug derived from the name. */
    slug: string;

    /** Permission action strings granted by this role. */
    permissions: Array<string>;

    /** Users assigned to this role. */
    users: Array<ObjectId | any>;

    /** When the role was created. */
    createdAt: Date;
    /** When the role was last updated. */
    updatedAt: Date;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

export type { IRoleDoc };
export default IRoleDoc;
