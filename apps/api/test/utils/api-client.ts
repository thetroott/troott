import request from 'supertest';
import app from '../../src/configs/app.config';
import { createTestUser } from './test-helpers';

/**
 * API Client for making test requests
 * Provides a fluent interface for API testing
 */
export class ApiClient {
    private token?: string;
    private baseUrl: string = '/api/v1';

    /**
     * Set authentication token
     */
    setAuth(token: string): this {
        this.token = token;
        return this;
    }

    /**
     * Authenticate as a test user
     */
    async authenticateAsUser(overrides?: any): Promise<this> {
        const testUser = await createTestUser(overrides);
        this.token = testUser.token;
        return this;
    }

    /**
     * Clear authentication
     */
    clearAuth(): this {
        this.token = undefined;
        return this;
    }

    /**
     * Make a GET request
     */
    get(url: string) {
        const req = request(app).get(`${this.baseUrl}${url}`);
        if (this.token) {
            req.set('Authorization', `Bearer ${this.token}`);
        }
        return req;
    }

    /**
     * Make a POST request
     */
    post(url: string) {
        const req = request(app).post(`${this.baseUrl}${url}`);
        if (this.token) {
            req.set('Authorization', `Bearer ${this.token}`);
        }
        return req;
    }

    /**
     * Make a PUT request
     */
    put(url: string) {
        const req = request(app).put(`${this.baseUrl}${url}`);
        if (this.token) {
            req.set('Authorization', `Bearer ${this.token}`);
        }
        return req;
    }

    /**
     * Make a PATCH request
     */
    patch(url: string) {
        const req = request(app).patch(`${this.baseUrl}${url}`);
        if (this.token) {
            req.set('Authorization', `Bearer ${this.token}`);
        }
        return req;
    }

    /**
     * Make a DELETE request
     */
    delete(url: string) {
        const req = request(app).delete(`${this.baseUrl}${url}`);
        if (this.token) {
            req.set('Authorization', `Bearer ${this.token}`);
        }
        return req;
    }
}

/**
 * Create a new API client instance
 */
export const createApiClient = (): ApiClient => {
    return new ApiClient();
};

/**
 * Create an authenticated API client
 */
export const createAuthenticatedClient = async (
    overrides?: any,
): Promise<ApiClient> => {
    const client = new ApiClient();
    await client.authenticateAsUser(overrides);
    return client;
};
