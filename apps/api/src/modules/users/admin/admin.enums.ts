export enum StaffUnit {
    ENGINEERING = 'engineering',
    PRODUCT = 'product',
    DESIGN = 'design',
    OPERATIONS = 'operations',
    FINANCE = 'finance',
}

export enum AdminRole {
    HEAD = 'head',
    MANAGER = 'manager',
    LEAD = 'lead',
    ASSOCIATE = 'assocaite',
    JUNIOR = 'junior',
}

export enum AccountManagerRole {
    OWNER = 'owner',
    MANAGER = 'manager',
    EDITOR = 'editor',
    ANALYST = 'analyst',
}

export enum VerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    UNDER_REVIEW = 'under-review',
    NEEDS_REVISION = 'needs-revision',
    SUSPENDED = 'suspended',
}

export enum AdminPermissions {
    Moderate = 'moderate',
    Create = 'create',
    ManageUsers = 'manageUsers',
    ManagePlaylists = 'managePlaylists',
    TrackEngagement = 'trackEngagement',
    FullAccess = 'fullAccess',
}
