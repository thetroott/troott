# feat-0001: Data models (exact shapes for `apps/api`)

Authoritative field-level definitions for new collections and minister evolution. Implement under:

- `apps/api/src/interfaces/core/*.interface.ts`
- `apps/api/src/models/core/*.model.ts`

Reuse existing shared types where noted.

---

## `DbModels` and collection names

Add to `[apps/api/src/types/common.enum.ts](../../../../apps/api/src/types/common.enum.ts)`:

```typescript
export enum DbModels {
    // ... existing ...
    ORGANIZATION = 'organization',
    BRANCH = 'branch',
    MINISTER_ASSIGNMENT = 'ministerAssignment',
    ORGANIZATION_MEMBER = 'organizationMember',
    AFFILIATION_REQUEST = 'affiliationRequest',
}
```


| `DbModels` value      | Mongoose model name  | MongoDB collection (default) |
| --------------------- | -------------------- | ---------------------------- |
| `ORGANIZATION`        | `Organization`       | `organizations`              |
| `BRANCH`              | `Branch`             | `branches`                   |
| `MINISTER_ASSIGNMENT` | `MinisterAssignment` | `ministerassignments`        |
| `ORGANIZATION_MEMBER` | `OrganizationMember` | `organizationmembers`        |
| `AFFILIATION_REQUEST` | `AffiliationRequest` | `affiliationrequests`        |


---

## Shared types (reuse — do not duplicate)

Import from existing modules:

```typescript
import type { ICountry } from '@/interfaces/common.interface';
import type { ISocials } from '@/interfaces/core/minister.interface';
import type { ILocation } from '@/interfaces/user.interface';
import type IUserDoc from '@/interfaces/user.interface';
import type IMinisterDoc from '@/interfaces/core/minister.interface';
import type IStudioDoc from '@/interfaces/core/studio.interface';
```

`ILocation` (user) — used for `headquarters` and `branch.location`:

```typescript
interface ILocation {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}
```

---

## 1. Organization

**File:** `interfaces/core/organization.interface.ts`

### Enums

```typescript
export enum OrganizationCategory {
    CHURCH = 'church',
    MINISTRY = 'ministry',
    NETWORK = 'network',
    FELLOWSHIP = 'fellowship',
    OUTREACH = 'outreach',
    DIOCESE = 'diocese',
    PARACHURCH = 'parachurch',
}

export enum OrganizationStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING_REVIEW = 'pending_review',
}
```

### `IOrganizationDoc`

```typescript
import { Document, Types } from 'mongoose';

type ObjectId = Types.ObjectId;

interface IOrganizationDoc extends Document {
    /** Public org code (e.g. `org-rccg-001`). Unique. */
    code: string;

    /** Display name (e.g. "RCCG", "Anglican Diocese of Ibadan"). */
    name: string;

    /** URL-safe slug. Unique. */
    slug: string;

    /** About / mission statement. */
    description: string;x

    /** CDN URL — square logo. */
    logo: string;

    /** CDN URL — cover / banner. */
    banner: string;

    /** High-level classification (church vs network vs diocese). */
    category: OrganizationCategory;

    /**
     * Denomination or tradition (free text).
     * Examples: "pentecostal", "anglican", "charismatic".
     * Use when category alone is not enough.
     */
    denomination?: string;

    /** HQ / registered office address. */
    headquarters: ILocation;

    /** Primary public contact email. */
    email: string;

    /** Primary public phone (digits). */
    phoneNumber: string;

    /** E.164 or dialling prefix (e.g. "+234"). */
    phoneCode: string;

    /** Official website. */
    websiteUrl: string;

    /** Public social links. */
    socials: Array<ISocials>;

    /** Platform-trusted canonical entity (admin-seeded). */
    canonical: boolean;

    /** Admin KYC / trust review passed. */
    verified: boolean;

    /** Visible on public discovery APIs. */
    published: boolean;

    /** Account-level org state. */
    status: OrganizationStatus;

    /** User who created the record (org founder or admin). */
    createdBy: ObjectId | IUserDoc;

    /** Branches are stored as refs on queries, not embedded. */
    // branches?: never on doc — use Branch.organization

    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
```

### Mongoose schema — `models/core/organization.model.ts`

```typescript
const OrganizationSchema = new Schema<IOrganizationDoc>(
    {
        code: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true },
        description: { type: String, default: '' },
        logo: { type: String, default: '' },
        banner: { type: String, default: '' },
        category: {
            type: String,
            enum: Object.values(OrganizationCategory),
            required: true,
            index: true,
        },
        denomination: { type: String, default: '' },
        headquarters: {
            address: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            country: { type: String, default: '' },
            postalCode: { type: String, default: '' },
        },
        email: { type: String, trim: true, lowercase: true, default: '' },
        phoneNumber: { type: String, default: '' },
        phoneCode: { type: String, default: '+234' },
        websiteUrl: { type: String, default: '' },
        socials: [
            {
                name: { type: String },
                url: { type: String },
                username: { type: String },
            },
        ],
        canonical: { type: Boolean, default: false, index: true },
        verified: { type: Boolean, default: false, index: true },
        published: { type: Boolean, default: false, index: true },
        status: {
            type: String,
            enum: Object.values(OrganizationStatus),
            default: OrganizationStatus.ACTIVE,
            index: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc, ret) {
                ret.id = ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    },
);

OrganizationSchema.index({ name: 'text', description: 'text', denomination: 'text' });
OrganizationSchema.index({ name: 1, denomination: 1 });
```

---

## 2. Branch

**File:** `interfaces/core/branch.interface.ts`

### Enums

```typescript
export enum BranchType {
    PARISH = 'parish',
    CATHEDRAL = 'cathedral',
    CAMPUS = 'campus',
    ASSEMBLY = 'assembly',
    CHURCH = 'church',
    CENTER = 'center',
    FELLOWSHIP = 'fellowship',
}

export enum BranchStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING_REVIEW = 'pending_review',
}
```

### `IBranchDoc`

```typescript
interface IBranchDoc extends Document {
    /** Public branch code. Unique. */
    code: string;

    /** Local name (e.g. "St. James Cathedral", "RCCG City of David"). */
    name: string;

    /** URL-safe slug. Unique per organization (compound index). */
    slug: string;

    description: string;
    logo: string;
    banner: string;

    /** Parish, cathedral, campus, etc. */
    branchType: BranchType;

    /** Parent organization. Required. */
    organization: ObjectId | IOrganizationDoc;

    /**
     * Optional sub-campus under another branch
     * (e.g. fellowship center under cathedral).
     */
    parentBranch?: ObjectId | IBranchDoc;

    /** Physical address of this branch. */
    location: ILocation;

    contactEmail: string;
    contactPhone: string;
    phoneCode: string;

    socials: Array<ISocials>;

    /**
     * Primary Troott Studio for publishing sermons from this branch.
     * Sermons remain studio-scoped in API v1.
     */
    studio?: ObjectId | IStudioDoc;

    verified: boolean;
    published: boolean;
    status: BranchStatus;

    createdBy: ObjectId | IUserDoc;

    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
```

### Mongoose schema — `models/core/branch.model.ts`

```typescript
const BranchSchema = new Schema<IBranchDoc>(
    {
        code: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        logo: { type: String, default: '' },
        banner: { type: String, default: '' },
        branchType: {
            type: String,
            enum: Object.values(BranchType),
            required: true,
            index: true,
        },
        organization: {
            type: Schema.Types.ObjectId,
            ref: DbModels.ORGANIZATION,
            required: true,
            index: true,
        },
        parentBranch: {
            type: Schema.Types.ObjectId,
            ref: DbModels.BRANCH,
            index: true,
        },
        location: {
            address: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            country: { type: String, default: '' },
            postalCode: { type: String, default: '' },
        },
        contactEmail: { type: String, trim: true, lowercase: true, default: '' },
        contactPhone: { type: String, default: '' },
        phoneCode: { type: String, default: '+234' },
        socials: [
            {
                name: { type: String },
                url: { type: String },
                username: { type: String },
            },
        ],
        studio: {
            type: Schema.Types.ObjectId,
            ref: DbModels.STUDIO,
            index: true,
        },
        verified: { type: Boolean, default: false, index: true },
        published: { type: Boolean, default: false, index: true },
        status: {
            type: String,
            enum: Object.values(BranchStatus),
            default: BranchStatus.ACTIVE,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc, ret) {
                ret.id = ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    },
);

BranchSchema.index({ organization: 1, slug: 1 }, { unique: true });
BranchSchema.index({ organization: 1, published: 1 });
BranchSchema.index({ name: 'text', description: 'text' });
```

---

## 3. Minister assignment

**File:** `interfaces/core/minister-assignment.interface.ts`

### Enums

```typescript
export enum MinistryRole {
    FOUNDER = 'founder',
    CO_FOUNDER = 'co_founder',
    LEAD_PASTOR = 'lead_pastor',
    ASSISTANT_PASTOR = 'assistant_pastor',
    ASSOCIATE_PASTOR = 'associate_pastor',
    VICAR = 'vicar',
    ASSISTANT_PRIEST = 'assistant_priest',
    CHOIR_PRIEST = 'choir_priest',
    RESIDENT_PASTOR = 'resident_pastor',
    TEACHER = 'teacher',
    EVANGELIST = 'evangelist',
    GUEST_MINISTER = 'guest_minister',
}

export enum AssignmentStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ENDED = 'ended',
    PENDING = 'pending',
}
```

### `IMinisterAssignmentDoc`

```typescript
interface IMinisterAssignmentDoc extends Document {
    /** Minister person record. */
    minister: ObjectId | IMinisterDoc;

    /** Umbrella organization. Required. */
    organization: ObjectId | IOrganizationDoc;

    /**
     * Specific parish/campus. Optional when role is org-wide
     * (e.g. diocesan bishop without a single branch).
     */
    branch?: ObjectId | IBranchDoc;

    /** Role at org/branch. */
    role: MinistryRole;

    /** Custom display title (e.g. "Senior Pastor", "Dean"). */
    title?: string;

    startDate?: Date;
    endDate?: Date;

    /**
     * Whether this is the minister's current primary affiliation.
     * At most one `isPrimary: true` per minister (enforced in service).
     */
    isPrimary: boolean;

  /** Lifecycle — use with endDate for history. */
    status: AssignmentStatus;

    /** User who created (org admin or system on approve). */
    createdBy: ObjectId | IUserDoc;

    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
```

### Mongoose schema — `models/core/minister-assignment.model.ts`

```typescript
const MinisterAssignmentSchema = new Schema<IMinisterAssignmentDoc>(
    {
        minister: {
            type: Schema.Types.ObjectId,
            ref: DbModels.MINISTER,
            required: true,
            index: true,
        },
        organization: {
            type: Schema.Types.ObjectId,
            ref: DbModels.ORGANIZATION,
            required: true,
            index: true,
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: DbModels.BRANCH,
            index: true,
        },
        role: {
            type: String,
            enum: Object.values(MinistryRole),
            required: true,
        },
        title: { type: String, default: '' },
        startDate: { type: Date },
        endDate: { type: Date },
        isPrimary: { type: Boolean, default: false, index: true },
        status: {
            type: String,
            enum: Object.values(AssignmentStatus),
            default: AssignmentStatus.ACTIVE,
            index: true,
        },
        createdBy: {
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
            transform(_doc, ret) {
                ret.id = ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    },
);

MinisterAssignmentSchema.index(
    { minister: 1, organization: 1, branch: 1 },
    {
        unique: true,
        partialFilterExpression: { status: AssignmentStatus.ACTIVE },
    },
);
MinisterAssignmentSchema.index({ minister: 1, status: 1 });
MinisterAssignmentSchema.index({ organization: 1, branch: 1, status: 1 });
```

---

## 4. Organization member (org admins)

**File:** `interfaces/core/organization-member.interface.ts`

Org admins are **users**, not ministers. Separate from `StudioMember` (upload permissions).

### Enums

```typescript
export enum OrganizationMemberRole {
    OWNER = 'owner',
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    EDITOR = 'editor',
    MEDIA_MANAGER = 'media_manager',
}

export enum OrganizationMemberStatus {
    ACTIVE = 'active',
    INVITED = 'invited',
    SUSPENDED = 'suspended',
    REMOVED = 'removed',
}
```

### `IOrganizationMemberDoc`

```typescript
interface IOrganizationMemberDoc extends Document {
    organization: ObjectId | IOrganizationDoc;
    user: ObjectId | IUserDoc;
    role: OrganizationMemberRole;
    status: OrganizationMemberStatus;

    invitedBy?: ObjectId | IUserDoc;
    invitedAt?: Date;
    joinedAt?: Date;

    /** Optional scope — admin for one branch only. */
    branch?: ObjectId | IBranchDoc;

    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
```

### Mongoose schema — `models/core/organization-member.model.ts`

```typescript
const OrganizationMemberSchema = new Schema<IOrganizationMemberDoc>(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: DbModels.ORGANIZATION,
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: DbModels.USER,
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: Object.values(OrganizationMemberRole),
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(OrganizationMemberStatus),
            default: OrganizationMemberStatus.ACTIVE,
            index: true,
        },
        invitedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
        invitedAt: { type: Date },
        joinedAt: { type: Date },
        branch: { type: Schema.Types.ObjectId, ref: DbModels.BRANCH },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc, ret) {
                ret.id = ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    },
);

OrganizationMemberSchema.index(
    { organization: 1, user: 1 },
    { unique: true },
);
```

---

## 5. Affiliation request

**File:** `interfaces/core/affiliation-request.interface.ts`

Minister-initiated join flow before an assignment exists.

### Enums

```typescript
export enum AffiliationRequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
}
```

### `IAffiliationRequestDoc`

```typescript
interface IAffiliationRequestDoc extends Document {
    organization: ObjectId | IOrganizationDoc;
    branch?: ObjectId | IBranchDoc;
    minister: ObjectId | IMinisterDoc;

    requestedRole: MinistryRole;
    message?: string;

    status: AffiliationRequestStatus;

    reviewedBy?: ObjectId | IUserDoc;
    reviewedAt?: Date;
    reviewNote?: string;

    /** Set when approved — links to created assignment. */
    assignment?: ObjectId | IMinisterAssignmentDoc;

    createdAt: Date;
    updatedAt: Date;
    _version: number;
    _id: ObjectId;
    id: ObjectId;
}
```

### Mongoose schema — `models/core/affiliation-request.model.ts`

```typescript
const AffiliationRequestSchema = new Schema<IAffiliationRequestDoc>(
    {
        organization: {
            type: Schema.Types.ObjectId,
            ref: DbModels.ORGANIZATION,
            required: true,
            index: true,
        },
        branch: { type: Schema.Types.ObjectId, ref: DbModels.BRANCH },
        minister: {
            type: Schema.Types.ObjectId,
            ref: DbModels.MINISTER,
            required: true,
            index: true,
        },
        requestedRole: {
            type: String,
            enum: Object.values(MinistryRole),
            required: true,
        },
        message: { type: String, default: '' },
        status: {
            type: String,
            enum: Object.values(AffiliationRequestStatus),
            default: AffiliationRequestStatus.PENDING,
            index: true,
        },
        reviewedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
        reviewedAt: { type: Date },
        reviewNote: { type: String, default: '' },
        assignment: {
            type: Schema.Types.ObjectId,
            ref: DbModels.MINISTER_ASSIGNMENT,
        },
    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            virtuals: true,
            getters: true,
            transform(_doc, ret) {
                ret.id = ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    },
);

AffiliationRequestSchema.index(
    { minister: 1, organization: 1, status: 1 },
);
```

---

## 6. Minister (existing — target evolution)

**File:** `interfaces/core/minister.interface.ts` (unchanged collection name `Minister`)

### Phase 1 (ship with org models — backward compatible)

Keep existing document shape. Add **optional** refs only:

```typescript
interface IMinisterDoc extends Document {
    // ... all existing fields unchanged ...

    /** Shortcut to primary assignment (optional). */
    primaryAssignment?: ObjectId | IMinisterAssignmentDoc;

    /**
     * Denormalized cache — do not use as source of truth after phase 2.
     * Existing profile block stays:
     */
    profile: {
        description: string;
        ministerialName: string;
        // DEPRECATED phase 2 — dual-write during phase 1:
        ministryName: string;
        ministryLogo: string;
        ministryType: string;
        ministryHQLocation: ILocation; // minister uses 3-field ILocation today
        phoneNumber: string;
        phoneCode: string;
        countryPhone: string;
        email: string;
        websiteUrl: string;
        socials: Array<ISocials>;
        languages: Array<string>;
    };

    // onboarding, verification, user, studio, sermons, playlists — unchanged
}
```

Add to `minister.model.ts` (phase 1):

```typescript
primaryAssignment: {
    type: Schema.Types.ObjectId,
    ref: DbModels.MINISTER_ASSIGNMENT,
    index: true,
},
```

### Phase 2 (target `profile` — person only)

```typescript
/** Public persona — no org branding on minister. */
export interface IMinisterProfile {
    description: string;
    ministerialName: string;
    languages: Array<string>;
}

interface IMinisterDoc extends Document {
    // identity fields unchanged: firstName, lastName, country, avatar, etc.

    profile: IMinisterProfile;

    primaryAssignment?: ObjectId | IMinisterAssignmentDoc;

    // studio, verification, onboarding, user — unchanged
}
```

Org/branch branding reads from `Organization` + `Branch` via assignments.

### Minister `ILocation` note

Minister interface today uses 3-field `ILocation` (`city`, `state`, `address`) in `minister.interface.ts`. New org/branch use 5-field `ILocation` from `user.interface.ts`. Migration mappers should pad `postalCode` / `country` when copying `ministryHQLocation` → `branch.location`.

---

## 7. Studio (existing — link only)

No schema rename. Optional back-reference (phase 2):

```typescript
// studio.interface.ts — optional
branch?: ObjectId | IBranchDoc;
```

```typescript
// studio.model.ts — optional
branch: { type: Schema.Types.ObjectId, ref: DbModels.BRANCH, index: true },
```

Primary link direction in v1: `**branch.studio**` (branch knows its publishing channel).

---

## Entity relationship summary

```txt
User ──< OrganizationMember >── Organization
User ──< Minister (1:1 via minister.user)
Minister ──< MinisterAssignment >── Organization
MinisterAssignment ──?── Branch (optional)
Branch ──> Organization (required)
Branch ──?── Studio (optional)
AffiliationRequest ──> Minister + Organization [+ Branch]
AffiliationRequest ──?── MinisterAssignment (on approve)
Minister ──?── Studio (existing sermon publish)
```

---

## Response DTO aliases (for mappers)

Naming convention matching existing `minister.dto.ts` / `studio.dto.ts`:


| Document                 | Response DTO                    | Create DTO                    | Update DTO                    |
| ------------------------ | ------------------------------- | ----------------------------- | ----------------------------- |
| `IOrganizationDoc`       | `OrganizationResponseDTO`       | `CreateOrganizationDTO`       | `UpdateOrganizationDTO`       |
| `IBranchDoc`             | `BranchResponseDTO`             | `CreateBranchDTO`             | `UpdateBranchDTO`             |
| `IMinisterAssignmentDoc` | `MinisterAssignmentResponseDTO` | `CreateMinisterAssignmentDTO` | `UpdateMinisterAssignmentDTO` |
| `IOrganizationMemberDoc` | `OrganizationMemberResponseDTO` | `InviteOrganizationMemberDTO` | `UpdateOrganizationMemberDTO` |
| `IAffiliationRequestDoc` | `AffiliationRequestResponseDTO` | `CreateAffiliationRequestDTO` | `ReviewAffiliationRequestDTO` |


Populate rules for public minister profile:

```typescript
// Example populate graph
MinisterAssignment.find({ minister, status: 'active' })
  .populate('organization')
  .populate('branch')
  .populate({ path: 'branch', populate: { path: 'studio' } });
```

---

## Related

- [PRODUCT.md](./PRODUCT.md) — product rules and phasing
- [TECH.md](./TECH.md) — modules, REST, migration

