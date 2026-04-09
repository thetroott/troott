import { Router } from 'express';
import Protect from '../../../middlewares/checkAuth.mdw';
import {
    createRole,
    getRole,
    getRoles,
    updateRole,
    deleteRole,
    getUserRoles,
    attachRoleToUser,
    detachRoleFromUser,
    assignWorkspaceRole,
    removeWorkspaceRole,
    assignProjectRole,
    removeProjectRole,
} from './role.controller';

const roleRoutes: Router = Router({ mergeParams: true });

// Role CRUD routes
roleRoutes.post('/', Protect, createRole);
roleRoutes.get('/list', Protect, getRoles);

// User role management routes (must come before /:id routes)
roleRoutes.get('/user/:userId', Protect, getUserRoles);
roleRoutes.post('/user/:userId/attach', Protect, attachRoleToUser);
roleRoutes.delete('/user/:userId/detach', Protect, detachRoleFromUser);

// Contextual role management routes (must come before /:id routes)
roleRoutes.post('/workspace/:workspaceId/assign', Protect, assignWorkspaceRole);
roleRoutes.delete('/workspace/:workspaceId/user/:userId', Protect, removeWorkspaceRole);
roleRoutes.post('/project/:projectId/assign', Protect, assignProjectRole);
roleRoutes.delete('/project/:projectId/user/:userId', Protect, removeProjectRole);

// Role CRUD routes with ID parameter (must come after specific routes)
roleRoutes.get('/:id', Protect, getRole);
roleRoutes.put('/:id', Protect, updateRole);
roleRoutes.delete('/:id', Protect, deleteRole);

export default roleRoutes;
