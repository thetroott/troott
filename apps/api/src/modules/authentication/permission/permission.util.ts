import { UserType } from '@/modules/users/user/user.interface';

/**
 * @name rolePermissionMap
 * @description Maps user roles to their assigned permissions
 * This map is used during seeding to assign permissions to roles
 */
export const rolePermissionMap: Record<string, string[]> = {
    [UserType.SUPERADMIN]: [
        // System Management - Full access
        'system:read',
        'system:update',
        'system:configure',
        'system:restart',

        // User Management
        'user:create',
        'user:read',
        'user:update',
        'user:delete',
        'user:disable',

        // Workspace Management
        'workspace:create',
        'workspace:read',
        'workspace:update',
        'workspace:delete',
        'workspace:manage-members',

        // Business Management
        'business:create',
        'business:read',
        'business:update',
        'business:delete',
        'business:verify',

        // Project Management
        'project:create',
        'project:read',
        'project:update',
        'project:delete',
        'project:publish',
        'project:close',
        'project:manage-members',

        // Team Management
        'team:create',
        'team:read',
        'team:update',
        'team:delete',
        'team:manage-members',

        // Task Management
        'task:create',
        'task:read',
        'task:update',
        'task:delete',
        'task:assign',
        'task:update-status',

        // Talent Management
        'talent:create',
        'talent:read',
        'talent:update',
        'talent:delete',

        // Hackathon Management
        'hackathon:create',
        'hackathon:read',
        'hackathon:update',
        'hackathon:delete',
        'hackathon:manage',

        // Entry Management
        'entry:create',
        'entry:read',
        'entry:update',
        'entry:delete',
        'entry:submit',

        // Submission Management
        'submission:create',
        'submission:read',
        'submission:update',
        'submission:delete',
        'submission:evaluate',

        // Form Management
        'form:create',
        'form:read',
        'form:update',
        'form:delete',

        // Guest Management (replaces mentor/judge)
        'guest:create',
        'guest:read',
        'guest:update',
        'guest:delete',
        'guest:assign',

        // Invitation Management
        'invitation:create',
        'invitation:read',
        'invitation:update',
        'invitation:delete',
        'invitation:send',

        // Portfolio Management
        'portfolio:read',
        'portfolio:update',

        // Referral Management
        'referral:read',
        'referral:create',

        // Notification Management
        'notification:read',
        'notification:update',
        'notification:delete',

        // Subscription & Transaction Management
        'subscription:create',
        'subscription:read',
        'subscription:update',
        'subscription:cancel',
        'transaction:create',
        'transaction:read',
        'transaction:update',
        'transaction:refund',
        'plan:create',
        'plan:read',
        'plan:update',
        'plan:delete',

        // Role & Permission Management
        'role:create',
        'role:read',
        'role:update',
        'role:disable',
        'role:delete',
        'permission:create',
        'permission:read',
        'permission:update',
        'permission:disable',
        'permission:delete',

        // API Management
        'apikey:create',
        'apikey:read',
        'apikey:update',
        'apikey:disable',
        'apikey:delete',

        // Analytics & Reporting
        'analytics:read',
        'analytics:update',
        'analytics:export',
        'revenue:read',
        'revenue:update',
        'metrics:create',
        'metrics:read',
        'metrics:update',
        'metrics:delete',
        'report:generate',
        'report:read',
        'report:export',
        'report:delete',
    ],

    [UserType.ADMIN]: [
        // System Management - Limited (no restart)
        'system:read',
        'system:update',
        'system:configure',

        // User Management
        'user:create',
        'user:read',
        'user:update',
        'user:delete',
        'user:disable',

        // Workspace Management
        'workspace:create',
        'workspace:read',
        'workspace:update',
        'workspace:delete',
        'workspace:manage-members',

        // Business Management
        'business:create',
        'business:read',
        'business:update',
        'business:delete',
        'business:verify',

        // Project Management
        'project:create',
        'project:read',
        'project:update',
        'project:delete',
        'project:publish',
        'project:close',
        'project:manage-members',

        // Team Management
        'team:create',
        'team:read',
        'team:update',
        'team:delete',
        'team:manage-members',

        // Task Management
        'task:create',
        'task:read',
        'task:update',
        'task:delete',
        'task:assign',
        'task:update-status',

        // Talent Management
        'talent:create',
        'talent:read',
        'talent:update',
        'talent:delete',

        // Hackathon Management
        'hackathon:create',
        'hackathon:read',
        'hackathon:update',
        'hackathon:delete',
        'hackathon:manage',

        // Entry Management
        'entry:create',
        'entry:read',
        'entry:update',
        'entry:delete',
        'entry:submit',

        // Submission Management
        'submission:create',
        'submission:read',
        'submission:update',
        'submission:delete',
        'submission:evaluate',

        // Form Management
        'form:create',
        'form:read',
        'form:update',
        'form:delete',

        // Guest Management (replaces mentor/judge)
        'guest:create',
        'guest:read',
        'guest:update',
        'guest:delete',
        'guest:assign',

        // Invitation Management
        'invitation:create',
        'invitation:read',
        'invitation:update',
        'invitation:delete',
        'invitation:send',

        // Portfolio Management
        'portfolio:read',
        'portfolio:update',

        // Referral Management
        'referral:read',
        'referral:create',

        // Notification Management
        'notification:read',
        'notification:update',
        'notification:delete',

        // Subscription & Transaction Management
        'subscription:create',
        'subscription:read',
        'subscription:update',
        'subscription:cancel',
        'transaction:create',
        'transaction:read',
        'transaction:update',
        'transaction:refund',
        'plan:create',
        'plan:read',
        'plan:update',
        'plan:delete',

        // Role & Permission Management
        'role:create',
        'role:read',
        'role:update',
        'role:disable',
        'role:delete',
        'permission:create',
        'permission:read',
        'permission:update',
        'permission:disable',
        'permission:delete',

        // API Management
        'apikey:create',
        'apikey:read',
        'apikey:update',
        'apikey:disable',
        'apikey:delete',

        // Analytics & Reporting
        'analytics:read',
        'analytics:update',
        'analytics:export',
        'revenue:read',
        'revenue:update',
        'metrics:create',
        'metrics:read',
        'metrics:update',
        'metrics:delete',
        'report:generate',
        'report:read',
        'report:export',
        'report:delete',
    ],

    [UserType.BUSINESS]: [
        // Workspace Management - Own workspaces
        'workspace:create',
        'workspace:read',
        'workspace:update',
        'workspace:manage-members',

        // Business Management - Own profile
        'business:read',
        'business:update',

        // Project Management - Own projects
        'project:create',
        'project:read',
        'project:update',
        'project:publish',
        'project:close',
        'project:manage-members',

        // Team Management - Own teams
        'team:create',
        'team:read',
        'team:update',
        'team:delete',
        'team:manage-members',

        // Task Management - Own tasks
        'task:create',
        'task:read',
        'task:update',
        'task:delete',
        'task:assign',
        'task:update-status',

        // Talent Management - View talents
        'talent:read',

        // Hackathon Management - Own hackathons
        'hackathon:create',
        'hackathon:read',
        'hackathon:update',
        'hackathon:delete',
        'hackathon:manage',

        // Entry Management - View entries
        'entry:read',

        // Submission Management - Own submissions
        'submission:create',
        'submission:read',
        'submission:update',
        'submission:evaluate',

        // Form Management - Own forms
        'form:create',
        'form:read',
        'form:update',
        'form:delete',

        // Guest Management - Assign guests (mentors/judges)
        'guest:read',
        'guest:assign',

        // Invitation Management - Send invitations
        'invitation:create',
        'invitation:read',
        'invitation:update',
        'invitation:delete',
        'invitation:send',

        // User Management - Limited
        'user:read',

        // Subscription & Transaction Management - Own
        'subscription:create',
        'subscription:read',
        'subscription:update',
        'subscription:cancel',
        'transaction:read',

        // Analytics & Reporting - Own data
        'analytics:read',
        'analytics:export',
        'metrics:read',
        'report:generate',
        'report:read',
        'report:export',

        // Notification Management
        'notification:read',
        'notification:update',
        'notification:delete',
    ],

    [UserType.TALENT]: [
        // Project Management - Participate
        'project:read',

        // Team Management - Join teams
        'team:read',

        // Task Management - Own tasks
        'task:read',
        'task:update-status',

        // Talent Management - Own profile
        'talent:read',
        'talent:update',

        // Hackathon Management - View and participate
        'hackathon:read',

        // Entry Management - Create and manage own entries
        'entry:create',
        'entry:read',
        'entry:update',
        'entry:submit',

        // Submission Management - Create and manage own submissions
        'submission:create',
        'submission:read',
        'submission:update',

        // Form Management - View and fill forms
        'form:read',

        // Portfolio Management - Own portfolio
        'portfolio:read',
        'portfolio:update',

        // Referral Management
        'referral:read',
        'referral:create',

        // User Management - Own profile
        'user:read',
        'user:update',

        // Notification Management
        'notification:read',
        'notification:update',
        'notification:delete',
    ],


    [UserType.USER]: [
        // Project Management - View public projects
        'project:read',

        // Hackathon Management - View public hackathons
        'hackathon:read',

        // Entry Management - View public entries
        'entry:read',

        // Form Management - View and fill public forms
        'form:read',

        // Talent Management - View public talent profiles
        'talent:read',

        // Portfolio Management - View public portfolios
        'portfolio:read',

        // User Management - Own profile
        'user:read',
        'user:update',

        // Notification Management
        'notification:read',
        'notification:update',
        'notification:delete',
    ],

    // Note: MENTOR and JUDGE user types have been removed.
    // Guest profiles (type: MENTOR or JUDGE) are now used instead.
    // Permissions for guests are handled via contextual permissions in the permission service.
};
