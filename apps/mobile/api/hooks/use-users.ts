/**
 * User Hooks
 * 
 * React Query hooks for user-related endpoints.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { del, get, patch, post } from '../client';
import { partnerEndpoints, userEndpoints } from '../config/endpoints';
import {
  AcceptPartnerInviteRequest,
  ApiResponse,
  ConfirmPartnerRequest,
  GetUsersParams,
  SendPartnerInviteRequest,
  UpdateUserProfileRequest,
  User
} from '../types';
import { queryKeys } from '../utils/query-keys';

/**
 * Get all users query hook
 */
export const useUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async (): Promise<User[]> => {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const endpoint = queryParams.toString() 
        ? `${userEndpoints.getAll}?${queryParams.toString()}`
        : userEndpoints.getAll;
      
      const response = await get<ApiResponse<User[]>>(endpoint);
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get user by ID query hook
 */
export const useUser = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async (): Promise<User> => {
      const response = await get<ApiResponse<User>>(userEndpoints.getById(userId));
      return response.data!;
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get user by email query hook
 */
export const useUserByEmail = (email: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.byEmail(email),
    queryFn: async (): Promise<User> => {
      const response = await get<ApiResponse<User>>(userEndpoints.getByEmail(email));
      return response.data!;
    },
    enabled: enabled && !!email,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Update user profile mutation hook
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserProfileRequest): Promise<User> => {
      const response = await patch<ApiResponse<User>>(
        userEndpoints.updateProfile,
        data
      );
      return response.data!;
    },
    onSuccess: (data) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.users.detail(data.id), data);
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

/**
 * Upload user avatar mutation hook
 */
export const useUploadUserAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: { uri: string; type: string; name: string }): Promise<User> => {
      const formData = new FormData();
      formData.append('avatar', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);

      const response = await post<ApiResponse<User>>(
        userEndpoints.uploadAvatar,
        formData
      );
      return response.data!;
    },
    onSuccess: (data) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.users.detail(data.id), data);
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

/**
 * Delete user account mutation hook
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await del(userEndpoints.deleteMe);
    },
    onSuccess: () => {
      // Clear all cache
      queryClient.clear();
    },
  });
};

/**
 * Send partner invite mutation hook
 * This links partners by profile code
 */
export const useSendPartnerInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendPartnerInviteRequest): Promise<{ message: string; partner?: User }> => {
      const response = await post<ApiResponse<{ message: string; partner?: User }> | { message: string; partner?: User }>(
        partnerEndpoints.sendInvite,
        data
      );
      // Handle both ApiResponse wrapper and direct response
      if ('data' in response && response.data) {
        return response.data;
      }
      return response as { message: string; partner?: User };
    },
    onSuccess: () => {
      // Invalidate user queries to refresh partner info
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};

/**
 * Confirm partner profile code before linking
 */
export const useConfirmPartner = () => {
  return useMutation({
    mutationFn: async (data: ConfirmPartnerRequest): Promise<User> => {
      const response = await post<ApiResponse<User> | User>(
        partnerEndpoints.confirmPartner,
        data
      );

      if ('data' in response && response.data) {
        return response.data;
      }

      return response as User;
    },
  });
};

/**
 * Accept partner invite mutation hook
 */
export const useAcceptPartnerInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AcceptPartnerInviteRequest): Promise<void> => {
      await post(partnerEndpoints.acceptInvite, data);
    },
    onSuccess: () => {
      // Invalidate user queries to refresh partner info
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Disconnect partner mutation hook
 */
export const useDisconnectPartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await post(partnerEndpoints.disconnect, {});
    },
    onSuccess: () => {
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

