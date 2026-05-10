/**
 * Circuit Breaker Pattern
 * 
 * Prevents cascading failures by stopping requests to failing services.
 */

import { features } from '../config';

/**
 * Circuit breaker state
 */
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

/**
 * Circuit breaker storage
 */
const circuitBreakers = new Map<string, CircuitBreakerState>();

/**
 * Circuit breaker configuration
 */
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
};

/**
 * Check if circuit breaker should allow request
 */
export const checkCircuitBreaker = (url: string): boolean => {
  if (!features.circuitBreaker) return true;

  const state = circuitBreakers.get(url);
  if (!state) return true;

  if (state.isOpen) {
    const timeSinceLastFailure = Date.now() - state.lastFailureTime;
    if (timeSinceLastFailure > CIRCUIT_BREAKER_CONFIG.resetTimeout) {
      // Reset circuit breaker
      circuitBreakers.delete(url);
      return true;
    }
    return false; // Circuit is open, block request
  }

  return true;
};

/**
 * Record circuit breaker failure
 */
export const recordCircuitBreakerFailure = (url: string): void => {
  if (!features.circuitBreaker) return;

  const state = circuitBreakers.get(url) || {
    failures: 0,
    lastFailureTime: 0,
    isOpen: false,
  };

  state.failures++;
  state.lastFailureTime = Date.now();

  if (state.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
    state.isOpen = true;
  }

  circuitBreakers.set(url, state);
};

/**
 * Record circuit breaker success
 */
export const recordCircuitBreakerSuccess = (url: string): void => {
  if (!features.circuitBreaker) {
    circuitBreakers.delete(url);
  }
};

