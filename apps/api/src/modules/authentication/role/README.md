# Role and Permission System

This document explains how the Role-Based Access Control (RBAC) system works in the Pacepard API, including both global roles and contextual roles.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Permission Format](#permission-format)
- [Global Roles](#global-roles)
- [Contextual Roles](#contextual-roles)
- [How Permissions Work](#how-permissions-work)
- [API Endpoints](#api-endpoints)
- [Using the Middleware](#using-the-middleware)
- [Service Functions](#service-functions)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Overview

The RBAC system provides fine-grained access control through:

1. **Global Roles**: System-wide roles assigned to users (e.g., `SUPERADMIN`, `ADMIN`, `BUSINESS`, `TALENT`, `USER`)
2. **Contextual Roles**: Resource-specific roles within workspaces, projects, or hackathons (e.g., `OWNER`, `MANAGER`, `CONTRIBUTOR`)
3. **Permissions**: Granular actions that can be performed (e.g., `workspace:create`, `project:read`, `task:update`)

Users can have:
- Multiple global roles
- Different contextual roles in different resources
- Explicit permissions (in addition to role-based permissions)
- Resource ownership (which grants full access)

## Architecture

### Two-Tier Permission System

```
┌─────────────────────────────────────────────────────────┐
│                    User Permissions                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. Base Role Permissions                                │
│     └─ From user.roles[] → role.permissions[]            │
│                                                           │
│  2. User-Level Permissions                               │
│     └─ From user.permissions[] (explicit grants)         │
│                                                           │
│  3. Resource Ownership                                    │
│     └─ If user created the resource → full access        │
│                                                           │
│  4. Contextual Role Permissions                          │
│     └─ From resource.members[].role → permission map     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Global vs Contextual Roles

**Global Roles** (Role Module):
- Stored in `user.roles` array
- System-wide permissions
- Examples: `SUPERADMIN`, `ADMIN`, `BUSINESS`, `TALENT`, `USER`
- Managed via `/roles/*` endpoints

**Contextual Roles** (Resource Modules):
- Stored in resource's `members` array (e.g., `workspace.members`, `project.members`)
- Resource-specific permissions
- Examples: `WorkspaceMemberRole.OWNER`, `ProjectMemberRole.CONTRIBUTOR`
- Managed via resource-specific endpoints (e.g., `/workspace/:id/members`)

## Permission Format

Permissions follow the format: `entity:action`

- **Entity**: The resource type (e.g., `workspace`, `project`, `task`, `user`)
- **Action**: The operation (e.g., `create`, `read`, `update`, `delete`)

### Examples

```
workspace:create      # Create workspaces
project:read          # View projects
task:update           # Modify tasks
user:delete           # Remove users
hackathon:manage      # Manage hackathons
```

### Wildcard Permissions

- `*:*` - Full access to everything (superadmin)
- `workspace:*` - All actions on workspaces
- `*:read` - Read access to all entities

## Global Roles

### Available Roles

1. **SUPERADMIN** (`super-admin`)
   - Full system access including system restart
   - Can manage all users, roles, and permissions
   - Only one superadmin can exist at a time

2. **ADMIN** (`admin`)
   - Platform administration (no system restart)
   - Can manage users, projects, hackathons
   - Full access to analytics and reporting

3. **BUSINESS** (`business`)
   - Create and manage workspaces
   - Create projects and hackathons
   - Manage teams and tasks
   - View analytics for own resources

4. **TALENT** (`talent`)
   - Participate in hackathons
   - Join projects and teams
   - Manage own portfolio
   - Create entries and submissions

5. **USER** (`user`)
   - View public content
   - Basic platform interaction
   - Limited permissions

### Role Permissions

Role permissions are defined in `permission.util.ts` via `rolePermissionMap`. Each role has a predefined set of permissions that are assigned during user creation or role attachment.

## Contextual Roles

Contextual roles provide resource-specific permissions beyond global roles.

### Workspace Member Roles

```typescript
enum WorkspaceMemberRole {
  OWNER = 'OWNER',      // Full access (maps to BUSINESS userType)
  MANAGER = 'MANAGER'   // Manage workspace and projects
}
```

**Permission Mapping:**
- `OWNER`: `['*:*']` - Full access
- `MANAGER`: Can manage workspace, projects, teams, and hackathons

### Project Member Roles

```typescript
enum ProjectMemberRole {
  OWNER = 'OWNER',           // Full access
  MAINTAINER = 'MAINTAINER', // Manage project and tasks
  CONTRIBUTOR = 'CONTRIBUTOR', // Contribute to project
  SUBSCRIBER = 'SUBSCRIBER'   // Read-only access
}
```

**Permission Mapping:**
- `OWNER`: `['*:*']` - Full access
- `MAINTAINER`: Can manage project, tasks, and members
- `CONTRIBUTOR`: Can create/update tasks and update status
- `SUBSCRIBER`: Read-only access

### Hackathon Member Roles

```typescript
enum HackathonMemberRole {
  OWNER = 'OWNER',        // Full access (can delete)
  ORGANIZER = 'ORGANIZER' // Manage hackathon operations
}
```

**Functional Roles:**
- `JUDGE`: Can evaluate submissions
- `MENTOR`: Can view entries and submissions
- `PARTICIPANT`: Can create entries and submissions

## How Permissions Work

### Permission Resolution Order

When checking if a user has permission, the system checks in this order:

1. **Super User Check**: If user is superadmin (`isSuper: true`), grant all permissions
2. **Base Role Permissions**: Check permissions from `user.roles[]`
3. **User-Level Permissions**: Check explicit `user.permissions[]`
4. **Resource Ownership**: If user created the resource, grant full access
5. **Contextual Role Permissions**: Check permissions from resource membership

### Permission Matching

The system supports:
- Exact match: `workspace:create` matches `workspace:create`
- Wildcard entity: `workspace:*` matches `workspace:create`, `workspace:read`, etc.
- Wildcard action: `*:read` matches `workspace:read`, `project:read`, etc.
- Global wildcard: `*:*` matches everything

### Caching

User permissions are cached in Redis with key: `rbac:perms:user:{userId}`

- Default TTL: 300 seconds (configurable via `RBAC_CACHE_TTL`)
- Cache is cleared when:
  - User roles are attached/detached
  - User permissions are updated
  - Role permissions are modified

## API Endpoints

### Global Role Management

#### Create Role
```http
POST /api/v1/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "custom-role",
  "description": "A custom role description",
  "permissions": ["workspace:read", "project:read"]
}
```

#### Get Role
```http
GET /api/v1/roles/:id
Authorization: Bearer {token}
```

#### List Roles
```http
GET /api/v1/roles/list?page=1&limit=10&sort=-createdAt
Authorization: Bearer {token}
```

#### Update Role
```http
PUT /api/v1/roles/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Updated description",
  "permissions": ["workspace:read", "workspace:update"]
}
```

#### Delete Role
```http
DELETE /api/v1/roles/:id
Authorization: Bearer {token}
```

### User Role Management

#### Get User Roles
```http
GET /api/v1/roles/user/:userId
Authorization: Bearer {token}
```

#### Attach Role to User
```http
POST /api/v1/roles/user/:userId/attach
Authorization: Bearer {token}
Content-Type: application/json

{
  "roleName": "admin"
}
```

#### Detach Role from User
```http
DELETE /api/v1/roles/user/:userId/detach
Authorization: Bearer {token}
Content-Type: application/json

{
  "roleName": "admin"
}
```

### Contextual Role Management

#### Assign Workspace Role
```http
POST /api/v1/roles/workspace/:workspaceId/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user-id-here",
  "role": "MANAGER"
}
```

#### Remove Workspace Role
```http
DELETE /api/v1/roles/workspace/:workspaceId/user/:userId
Authorization: Bearer {token}
```

#### Assign Project Role
```http
POST /api/v1/roles/project/:projectId/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user-id-here",
  "role": "CONTRIBUTOR"
}
```

#### Remove Project Role
```http
DELETE /api/v1/roles/project/:projectId/user/:userId
Authorization: Bearer {token}
```

## Using the Middleware

### Basic Usage

Protect routes with permission checks using the `checkPermission` middleware:

```typescript
import checkPermission from '../../middlewares/checkPermission.mdw';
import Protect from '../../middlewares/checkAuth.mdw';

// Single permission
router.post('/workspaces', 
  Protect, 
  checkPermission('workspace:create'),
  createWorkspace
);

// Multiple permissions (OR logic - any one passes)
router.delete('/workspaces/:id',
  Protect,
  checkPermission(['workspace:delete', 'workspace:manage']),
  deleteWorkspace
);

// With ownership check
router.put('/workspaces/:id',
  Protect,
  checkPermission('workspace:update', {
    ownerParam: 'id',  // Check if user owns the workspace
    checkOwnership: true
  }),
  updateWorkspace
);
```

### Middleware Options

```typescript
checkPermission(permission, options?)
```

**Options:**
- `ownerParam`: Parameter name to extract resource owner ID from (params, body, or query)
- `ownerResolver`: Custom async function to resolve resource owner ID
- `checkOwnership`: Whether to allow access if user owns the resource (default: `true`)

**Examples:**

```typescript
// Check ownership from route parameter
checkPermission('workspace:update', {
  ownerParam: 'workspaceId'
})

// Custom owner resolver
checkPermission('project:delete', {
  ownerResolver: async (req) => {
    const project = await Project.findById(req.params.projectId);
    return project?.createdBy?.toString() || null;
  }
})

// Disable ownership check
checkPermission('user:read', {
  checkOwnership: false
})
```

## Service Functions

### Permission Service

#### Check Permission

```typescript
import permissionService from '../permission/permission.service';

// Check if user has permission
const hasAccess = await permissionService.hasPermission(
  user,  // IUserDoc or userId string
  'workspace:create'
);

// Check with resource context
const canUpdate = await permissionService.hasPermission(
  user,
  'project:update',
  {
    resource: projectDoc,
    resourceType: 'project',
    checkOwnership: true
  }
);

// Check with entity/action object
const canDelete = await permissionService.hasPermission(
  user,
  { entity: 'task', action: 'delete' },
  {
    resourceOwnerId: task.createdBy.toString()
  }
);
```

#### Resolve User Permissions

```typescript
// Get all permissions for a user
const permissions = await permissionService.resolveUserPermissions(userId);
// Returns: Set<string> of all permission strings
```

#### Clear User Cache

```typescript
// Clear cached permissions for a user
await permissionService.clearUserCache(userId);
```

### Role Service

#### Attach Role

```typescript
import roleService from './role.service';

const result = await roleService.attachRole(user, 'admin');
if (result.error) {
  console.error(result.message);
}
```

#### Detach Role

```typescript
const result = await roleService.detachRole(user, 'admin');
```

#### Get User Roles

```typescript
const result = await roleService.getUserRoles(userId);
const roles = result.data; // Array of role documents
```

### Role Utilities

```typescript
import {
  getWorkspaceMemberRole,
  getProjectMemberRole,
  getContextualPermissions,
  matchPermission
} from './role.util';

// Get user's role in a workspace
const memberRole = getWorkspaceMemberRole(user, workspace);

// Get permissions for a contextual role
const perms = getContextualPermissions('workspace', WorkspaceMemberRole.MANAGER);

// Check if permission matches (supports wildcards)
const matches = matchPermission('workspace:create', ['workspace:*']); // true
```

## Examples

### Example 1: Protecting a Route

```typescript
// routes/workspace.router.ts
import checkPermission from '../../middlewares/checkPermission.mdw';
import Protect from '../../middlewares/checkAuth.mdw';

router.post('/',
  Protect,
  checkPermission('workspace:create'),
  workspaceController.createWorkspace
);

router.get('/:id',
  Protect,
  checkPermission('workspace:read', {
    ownerParam: 'id',
    checkOwnership: true
  }),
  workspaceController.getWorkspace
);
```

### Example 2: Checking Permissions in Service

```typescript
// workspace.service.ts
import permissionService from '../permission/permission.service';

async function updateWorkspace(workspaceId: string, userId: string, data: any) {
  const workspace = await Workspace.findById(workspaceId);
  
  // Check permission with resource context
  const canUpdate = await permissionService.hasPermission(
    userId,
    'workspace:update',
    {
      resource: workspace,
      resourceType: 'workspace',
      checkOwnership: true
    }
  );

  if (!canUpdate) {
    throw new Error('Insufficient permissions');
  }

  // Update workspace...
}
```

### Example 3: Assigning Contextual Role

```typescript
// In workspace controller
async function addMember(req: Request, res: Response) {
  const { workspaceId } = req.params;
  const { userId, role } = req.body;

  // Check if requester can manage members
  const canManage = await permissionService.hasPermission(
    req.user,
    'workspace:manage-members',
    {
      resource: await Workspace.findById(workspaceId),
      resourceType: 'workspace'
    }
  );

  if (!canManage) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Add member with role
  await workspaceService.addMember(workspaceId, userId, role);
  
  res.json({ message: 'Member added successfully' });
}
```

### Example 4: Creating a Custom Role

```typescript
// Create a new role programmatically
const roleData = {
  name: 'project-manager',
  description: 'Can manage projects and teams',
  permissions: [
    'project:create',
    'project:read',
    'project:update',
    'project:manage-members',
    'team:create',
    'team:read',
    'team:update',
    'task:*'
  ]
};

const result = await roleRepository.createRole(roleData);

// Attach to user
await roleService.attachRole(user, 'project-manager');
```

## Best Practices

### 1. Use Middleware for Route Protection

Always use `checkPermission` middleware for route-level protection:

```typescript
// ✅ Good
router.post('/workspaces', 
  Protect, 
  checkPermission('workspace:create'),
  controller.create
);

// ❌ Bad - checking in controller
router.post('/workspaces', Protect, controller.create);
// Then checking in controller manually
```

### 2. Check Contextual Permissions for Resource Operations

When working with resources (workspaces, projects, etc.), always check contextual permissions:

```typescript
// ✅ Good - checks contextual role
const canUpdate = await permissionService.hasPermission(
  user,
  'project:update',
  {
    resource: project,
    resourceType: 'project',
    checkOwnership: true
  }
);

// ❌ Bad - only checks base role
const canUpdate = await permissionService.hasPermission(user, 'project:update');
```

### 3. Clear Cache When Permissions Change

Always clear user cache when roles or permissions are modified:

```typescript
// After attaching/detaching role
await roleService.attachRole(user, 'admin');
await permissionService.clearUserCache(user._id.toString());
```

### 4. Use Wildcards Sparingly

Wildcards (`*:*`, `workspace:*`) should be reserved for:
- Superadmin role
- Resource owners (contextual)
- System-level operations

### 5. Validate Permissions Before Assignment

When assigning permissions to roles, validate they exist:

```typescript
// ✅ Good - validate permissions exist
const validPermissions = await Permission.find({
  action: { $in: roleData.permissions }
});

if (validPermissions.length !== roleData.permissions.length) {
  throw new Error('Invalid permissions');
}
```

### 6. Document Permission Requirements

Document which permissions are required for each endpoint:

```typescript
/**
 * @name createWorkspace
 * @description Creates a new workspace
 * @permission workspace:create
 * @route POST /workspaces
 */
export const createWorkspace = asyncHandler(...);
```

### 7. Handle Permission Errors Gracefully

Return appropriate HTTP status codes:

```typescript
// 401 - Unauthorized (not authenticated)
// 403 - Forbidden (authenticated but no permission)
if (!user) {
  return res.status(401).json({ error: 'Unauthorized' });
}

if (!hasPermission) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### 8. Test Permission Scenarios

Test various permission scenarios:
- Base role permissions
- Contextual role permissions
- Resource ownership
- Wildcard permissions
- Multiple roles

## Troubleshooting

### Permission Not Working

1. **Check cache**: Clear user permission cache
   ```typescript
   await permissionService.clearUserCache(userId);
   ```

2. **Verify role assignment**: Check if user has the role
   ```typescript
   const roles = await roleService.getUserRoles(userId);
   ```

3. **Check permission format**: Ensure format is `entity:action` (lowercase)
   ```typescript
   // ✅ Correct
   'workspace:create'
   
   // ❌ Wrong
   'Workspace:Create'
   'workspace_create'
   ```

4. **Verify contextual role**: Check if user is a member of the resource
   ```typescript
   const memberRole = getWorkspaceMemberRole(user, workspace);
   ```

### Cache Issues

- Default TTL is 300 seconds
- Cache is automatically cleared on role/permission changes
- Manually clear: `await permissionService.clearUserCache(userId)`

### Superadmin Restrictions

- Only one superadmin can exist at a time
- Cannot detach superadmin role if it's the only one
- Superadmin role cannot be created via API (system-managed)

## Related Files

- `role.service.ts` - Role management service
- `role.controller.ts` - Role API endpoints
- `role.repository.ts` - Role data access
- `role.model.ts` - Role database model
- `role.util.ts` - Role utility functions
- `permission.service.ts` - Permission checking service
- `permission.model.ts` - Permission database model
- `permission.util.ts` - Permission mappings
- `checkPermission.mdw.ts` - Permission middleware

## Additional Resources

- [Contextual Roles Architecture](./CONTEXTUAL_ROLES_ARCHITECTURE.md) - Detailed architecture documentation
- [Engineering Principles Analysis](./ENGINEERING_PRINCIPLES_ANALYSIS.md) - System design principles
