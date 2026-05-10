/**
 * Authentication Token Management
 * 
 * Handles secure storage, retrieval, and refresh of JWT tokens.
 * Uses Expo SecureStore for secure token storage.
 */

import Bugsnag from '@bugsnag/expo';
import * as SecureStore from 'expo-secure-store';

/**
 * Token storage keys
 */
const TOKEN_KEY = 'trifold_auth_token';
const REFRESH_TOKEN_KEY = 'trifold_refresh_token';
const TOKEN_EXPIRY_KEY = 'trifold_token_expiry';

/**
 * Token data structure
 */
export interface TokenData {
  token: string;
  refreshToken?: string;
  expiresAt?: number; // Unix timestamp in milliseconds
}

/**
 * Store authentication token securely
 * 
 * @param tokenData - Token information including token, refresh token, and expiry
 */
export const storeToken = async (tokenData: TokenData): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, tokenData.token);
    
    if (tokenData.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenData.refreshToken);
    }
    
    if (tokenData.expiresAt) {
      await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, tokenData.expiresAt.toString());
    }
  } catch (error) {
    Bugsnag.notify(error as Error, (event) => {
      event.addMetadata('auth', { action: 'storeToken' });
    });
    throw new Error('Failed to store authentication token');
  }
};

/**
 * Retrieve authentication token
 * 
 * @returns The JWT token or null if not found
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    Bugsnag.notify(error as Error, (event) => {
      event.addMetadata('auth', { action: 'getToken' });
    });
    return null;
  }
};

/**
 * Retrieve refresh token
 * 
 * @returns The refresh token or null if not found
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    Bugsnag.notify(error as Error, (event) => {
      event.addMetadata('auth', { action: 'getRefreshToken' });
    });
    return null;
  }
};

/**
 * Check if token is expired
 * 
 * @returns true if token is expired or expiry is unknown
 */
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const expiryStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return true; // No expiry info, consider expired
    
    const expiry = parseInt(expiryStr, 10);
    const now = Date.now();
    
    // Add 5 minute buffer before actual expiry
    return now >= (expiry - 5 * 60 * 1000);
  } catch (error) {
    Bugsnag.notify(error as Error, (event) => {
      event.addMetadata('auth', { action: 'isTokenExpired' });
    });
    return true; // On error, consider expired for safety
  }
};

/**
 * Clear all stored authentication data
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY),
    ]);
  } catch (error) {
    Bugsnag.notify(error as Error, (event) => {
      event.addMetadata('auth', { action: 'clearTokens' });
    });
    // Don't throw - best effort cleanup
  }
};

/**
 * Get token expiry timestamp
 * 
 * @returns Expiry timestamp or null
 */
export const getTokenExpiry = async (): Promise<number | null> => {
  try {
    const expiryStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
    return expiryStr ? parseInt(expiryStr, 10) : null;
  } catch (error) {
    Bugsnag.notify(error as Error, (event) => {
      event.addMetadata('auth', { action: 'getTokenExpiry' });
    });
    return null;
  }
};

