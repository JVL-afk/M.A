/**
 * Environment detection utility
 * 
 * This utility provides functions to detect the current runtime environment
 * and helps with conditional code execution based on the environment.
 */

// Is the code running in a browser environment?
export const isBrowser = typeof window !== 'undefined';

// Is the code running on the server?
export const isServer = !isBrowser;

// Is the code running in Edge Runtime?
export const isEdgeRuntime = 
  isServer && 
  typeof process !== 'undefined' && 
  process.env.NEXT_RUNTIME === 'edge';

// Is the code running in Node.js?
export const isNodeRuntime = isServer && !isEdgeRuntime;

// Is the code running in development mode?
export const isDevelopment = 
  process.env.NODE_ENV === 'development';

// Is the code running in production mode?
export const isProduction = 
  process.env.NODE_ENV === 'production';

/**
 * Safely executes a function only in a specific environment
 * @param environment The environment to check for
 * @param fn The function to execute
 * @param fallback Optional fallback function for other environments
 */
export function runInEnvironment<T>(
  environment: 'browser' | 'server' | 'edge' | 'node',
  fn: () => T,
  fallback?: () => T
): T | undefined {
  let shouldRun = false;
  
  switch (environment) {
    case 'browser':
      shouldRun = isBrowser;
      break;
    case 'server':
      shouldRun = isServer;
      break;
    case 'edge':
      shouldRun = isEdgeRuntime;
      break;
    case 'node':
      shouldRun = isNodeRuntime;
      break;
  }
  
  if (shouldRun) {
    return fn();
  } else if (fallback) {
    return fallback();
  }
  
  return undefined;
}

/**
 * Environment-safe crypto functions
 */
export const crypto = {
  /**
   * Generates a random string of specified length
   * Works in both Node.js and Edge Runtime
   */
  randomString: (length: number = 32): string => {
    if (isBrowser) {
      // Browser implementation
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else if (isNodeRuntime) {
      // Node.js implementation
      const crypto = require('crypto');
      return crypto.randomBytes(length).toString('hex');
    } else {
      // Edge Runtime implementation (no crypto module)
      // Use Math.random as fallback (less secure but works everywhere)
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length * 2; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }
  },
  
  /**
   * Hashes a string using SHA-256
   * Works in both Node.js and Edge Runtime
   */
  sha256: async (message: string): Promise<string> => {
    if (isBrowser || isEdgeRuntime) {
      // Browser and Edge implementation using Web Crypto API
      const msgUint8 = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js implementation
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(message).digest('hex');
    }
  }
};
