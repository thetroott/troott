import { describe, it, beforeEach, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/configs/app.config';
import {
    createTestUser,
    createBusinessUser,
    expectSuccessResponse,
    expectErrorResponse,
    TestUser,
} from '../utils/test-helpers';
import { createBusiness } from '../factories/business.factory';
import { createWorkspace } from '../factories/workspace.factory';
import { createProject } from '../factories/project.factory';
import { createTeam } from '../factories/team.factory';
import { createTask } from '../factories/task.factory';
import { IUserDoc } from '../../src/modules/user/user.interface';
import { IBusinessDoc } from '../../src/modules/business/business.interface';
import { IWorkspaceDoc } from '../../src/modules/workspace/workspace.interface';
import { IProjectDoc } from '../../src/modules/project/project.interface';
import { ITeamDoc } from '../../src/modules/team/team.interface';
import { ITaskDoc } from '../../src/modules/task/task.interface';

/**
 * Integration tests for multi-entity workflows
 * Tests complete user flows across multiple modules
 */

describe('Multi-Entity Workflow Integration Tests', () => {
    let businessUser: TestUser;
    let business: IBusinessDoc;
    let workspace: IWorkspaceDoc;
    let project: IProjectDoc;
    let team: ITeamDoc;
    let task: ITaskDoc;

    beforeEach(async () => {
        // Create a business user for the workflow
        businessUser = await createBusinessUser();

        // Create business entity
        business = await createBusiness({
            user: businessUser.user,
            createdBy: String(businessUser.user._id || businessUser.user.id),
        });

        // Create workspace
        workspace = await createWorkspace({
            createdBy: businessUser.user,
            members: [businessUser.user],
        });

        // Create project
        project = await createProject({
            workspace,
            business,
            createdBy: businessUser.user,
        });

        // Create team
        team = await createTeam({
            workspace,
            business,
            project,
            createdBy: businessUser.user,
            members: [{ user: businessUser.user, role: 'LEAD' as any }],
        });

        // Create task
        task = await createTask({
            workspaceId: workspace,
            businessId: business,
            projectId: project,
            teamId: team,
            createdBy: businessUser.user,
            assignedTo: [businessUser.user],
        });
    });

    describe('Complete Project Workflow', () => {
        it('should create a complete project hierarchy: workspace → project → team → task', async () => {
            // Verify workspace exists
            expect(workspace).toBeDefined();
            expect(workspace.code).toBeDefined();
            expect(workspace.name).toBeDefined();

            // Verify project exists and is linked to workspace and business
            expect(project).toBeDefined();
            expect(project.code).toBeDefined();
            expect(String(project.workspace)).toBe(String(workspace._id));
            expect(String(project.business)).toBe(String(business._id));

            // Verify team exists and is linked correctly
            expect(team).toBeDefined();
            expect(team.code).toBeDefined();
            expect(String(team.workspace)).toBe(String(workspace._id));
            expect(String(team.project)).toBe(String(project._id));

            // Verify task exists and follows strict hierarchy
            expect(task).toBeDefined();
            expect(task.code).toBeDefined();
            expect(String(task.workspaceId)).toBe(String(workspace._id));
            expect(String(task.businessId)).toBe(String(business._id));
            expect(String(task.projectId)).toBe(String(project._id));
            expect(String(task.teamId)).toBe(String(team._id));
        });

        it('should allow adding members to project', async () => {
            const newMember = await createTestUser();

            // Add member to project via API
            const response = await request(app)
                .post(
                    `/api/v1/workspaces/${workspace._id}/projects/${project._id}/members`,
                )
                .set('Authorization', `Bearer ${businessUser.token}`)
                .send({
                    userId: String(newMember.user._id || newMember.user.id),
                    role: 'CONTRIBUTOR',
                });

            expectSuccessResponse(response);
            expect(response.body.data).toHaveProperty('members');
        });

        it('should allow creating multiple tasks for a project', async () => {
            const task2 = await createTask({
                workspaceId: workspace,
                businessId: business,
                projectId: project,
                teamId: team,
                createdBy: businessUser.user,
            });

            const task3 = await createTask({
                workspaceId: workspace,
                businessId: business,
                projectId: project,
                teamId: team,
                createdBy: businessUser.user,
            });

            expect(task2).toBeDefined();
            expect(task3).toBeDefined();
            expect(String(task2.projectId)).toBe(String(project._id));
            expect(String(task3.projectId)).toBe(String(project._id));
        });
    });

    describe('Business → Workspace → Project Hierarchy', () => {
        it('should maintain proper hierarchy relationships', async () => {
            // Business owns workspace
            expect(String(workspace.createdBy)).toBe(
                String(businessUser.user._id || businessUser.user.id),
            );

            // Workspace contains project
            expect(String(project.workspace)).toBe(String(workspace._id));
            expect(String(project.business)).toBe(String(business._id));

            // Project contains team
            expect(String(team.project)).toBe(String(project._id));
            expect(String(team.workspace)).toBe(String(workspace._id));
            expect(String(team.business)).toBe(String(business._id));

            // Team contains tasks
            expect(String(task.teamId)).toBe(String(team._id));
            expect(String(task.projectId)).toBe(String(project._id));
        });

        it('should allow querying projects by workspace', async () => {
            const response = await request(app)
                .get(`/api/v1/workspaces/${workspace._id}/projects`)
                .set('Authorization', `Bearer ${businessUser.token}`);

            expectSuccessResponse(response);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('Task Assignment Workflow', () => {
        it('should assign task to multiple users', async () => {
            const user1 = await createTestUser();
            const user2 = await createTestUser();

            const response = await request(app)
                .post(`/api/v1/tasks/${task._id}/assign`)
                .set('Authorization', `Bearer ${businessUser.token}`)
                .send({
                    userIds: [
                        String(user1.user._id || user1.user.id),
                        String(user2.user._id || user2.user.id),
                    ],
                });

            expectSuccessResponse(response);
        });

        it('should update task status through workflow', async () => {
            // Start task
            const startResponse = await request(app)
                .put(`/api/v1/tasks/${task._id}`)
                .set('Authorization', `Bearer ${businessUser.token}`)
                .send({ status: 'in_progress' });

            expectSuccessResponse(startResponse);

            // Complete task
            const completeResponse = await request(app)
                .put(`/api/v1/tasks/${task._id}`)
                .set('Authorization', `Bearer ${businessUser.token}`)
                .send({ status: 'done' });

            expectSuccessResponse(completeResponse);
            expect(completeResponse.body.data.status).toBe('done');
        });
    });

    describe('Project Lifecycle Workflow', () => {
        it('should publish a project and make it available', async () => {
            const response = await request(app)
                .post(`/api/v1/projects/${project._id}/publish`)
                .set('Authorization', `Bearer ${businessUser.token}`);

            expectSuccessResponse(response);
            expect(response.body.data.status).toBe('published');
            expect(response.body.data.isOpen).toBe(true);
        });

        it('should close a published project', async () => {
            // First publish
            await request(app)
                .post(`/api/v1/projects/${project._id}/publish`)
                .set('Authorization', `Bearer ${businessUser.token}`);

            // Then close
            const response = await request(app)
                .post(`/api/v1/projects/${project._id}/close`)
                .set('Authorization', `Bearer ${businessUser.token}`);

            expectSuccessResponse(response);
            expect(response.body.data.status).toBe('closed');
            expect(response.body.data.isOpen).toBe(false);
        });
    });
});
