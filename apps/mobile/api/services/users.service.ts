/**
 * Users Service
 * 
 * Service layer for user-related API calls.
 */

import { partnerEndpoints, userEndpoints } from '../config/endpoints';
import {
    AcceptPartnerInviteRequest,
    GetUsersParams,
    SendPartnerInviteRequest,
    UpdateUserProfileRequest,
    User,
} from '../types';
import { BaseService } from './base.service';

/**
 * Users service
 */
export class UsersService extends BaseService {
  /**
   * Get all users
   */
  async getUsers(params?: GetUsersParams): Promise<User[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const endpoint = queryParams.toString() 
      ? `${userEndpoints.getAll}?${queryParams.toString()}`
      : userEndpoints.getAll;
    
    const response = await this.get<{ data: User[] }>(endpoint);
    return this.extractData(response) || [];
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const response = await this.get<{ data: User }>(userEndpoints.getById(userId));
    return this.extractData(response);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User> {
    const response = await this.get<{ data: User }>(userEndpoints.getByEmail(email));
    return this.extractData(response);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserProfileRequest): Promise<User> {
    const response = await this.patch<{ data: User }>(userEndpoints.updateProfile, data);
    return this.extractData(response);
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(formData: FormData): Promise<{ data: User }> {
    const response = await this.post<{ data: User }>(userEndpoints.uploadAvatar, formData, {
      headers: {}, // Let browser set Content-Type for FormData
    });
    return response;
  }

  /**
   * Delete current user
   */
  async deleteMe(): Promise<{ message: string }> {
    const response = await this.delete<{ message: string }>(userEndpoints.deleteMe);
    return this.extractData(response);
  }

  /**
   * Send partner invite
   */
  async sendPartnerInvite(data: SendPartnerInviteRequest): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(partnerEndpoints.sendInvite, data);
    return this.extractData(response);
  }

  /**
   * Accept partner invite
   */
  async acceptPartnerInvite(data: AcceptPartnerInviteRequest): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(partnerEndpoints.acceptInvite, data);
    return this.extractData(response);
  }

  /**
   * Disconnect partner
   */
  async disconnectPartner(): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(partnerEndpoints.disconnect);
    return this.extractData(response);
  }
}

/**
 * Singleton instance
 */
export const usersService = new UsersService();

