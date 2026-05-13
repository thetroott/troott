import { Document, Types } from 'mongoose';
import { Upload } from './common.interface';
import IUserDoc from './user.interface';

type ObjectId = Types.ObjectId;

/**
 * Mongoose document for an internal staff or board member.
 *
 * Admins are linked to an {@link IUserDoc} for authentication but carry
 * additional organisational metadata (department, position, access level)
 * that drives the admin dashboard permission model.
 */
interface IAdminDoc extends Document {
    /** Employee / board-member ID visible in the admin dashboard. */
    code: string;

    /** First name. */
    firstName: string;
    /** Last name. */
    lastName: string;
    /** URL-safe slug derived from the full name. */
    slug: string;
    /** Corporate email address. */
    email: string;
    /** Profile picture upload reference. */
    avatar: Upload;
    /** Banner / cover image upload reference. */
    banner: Upload;

    /** Whether this admin is operational staff or a board member. */
    adminType: AdminTypeEnum;
    /** Organisational department the admin belongs to. */
    department: AdminDepartmentEnum;
    /** Seniority level within the company hierarchy. */
    position: CompanyRoleEnum;

    /** Numeric access level used for coarse-grained permission checks. */
    accessLevel: number;

    /** The user who created this admin record. */
    createdBy: IUserDoc | any;
    /** Reference to the admin's settings document. */
    settings: ObjectId | any;

    /** API keys issued to this admin. */
    apiKeys: Array<{ key: string; createdAt: Date; lastUsed: Date }>;

    /** The underlying authentication user. */
    user: IUserDoc | any;

    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-update timestamp. */
    updatedAt: string;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

/** Broad category of an admin account. */
export enum AdminTypeEnum {
    /** Operational staff -- must belong to a department. */
    STAFF = 'staff',
    /** Board of directors -- executives have departments, advisors may not. */
    BOARD = 'board',
}

/** Organisational departments within the company. */
export enum AdminDepartmentEnum {
    /** Product, design, engineering, and marketing. */
    PRODUCT_ENGINEERING = 'product-engineering',
    /** Platform engineering -- billing, messaging, internal APIs, SDKs. */
    PLATFORM_ENGINEERING = 'platform-engineering',
    /** Developer tools, documentation, and platform. */
    DEVELOPER_EXPERIENCE = 'developer-experience',
    /** CI/CD, monitoring, deployment, reliability, and scale. */
    INFRASTRUCTURE = 'infrastructure',
    /** Data engineering, data science, and machine learning. */
    DATA = 'data',
    /** Authentication, authorisation, compliance, and data protection. */
    SECURITY = 'security',
    /** Hackathon education platform, API education. */
    EDUCATION = 'education',
    /** HR, finance, legal, support, and customer success. */
    PEOPLE = 'people',
}

/** Seniority levels within the company career ladder. */
export enum CompanyRoleEnum {
    JUNIOR = 'junior',
    ASSOCIATE = 'associate',
    INTERMEDIATE = 'intermediate',
    SENIOR = 'senior',
    STAFF = 'staff',
    PRINCIPAL = 'principal',
    MANAGER = 'manager',
    DIRECTOR = 'director',
    VP = 'vp',
    EXECUTIVE = 'executive',
}

export type { IAdminDoc };
export default IAdminDoc;
