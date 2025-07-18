import { isBrowser, isNodeRuntime, isEdgeRuntime } from './FINAL-environment-detection';

/**
 * Universal Crypto Utilities
 * 
 * This module provides crypto functions that work across all environments:
 * - Browser
 * - Node.js
 * - Edge Runtime
 */

/**
 * Generates a random string of specified length
 * Works in all environments (Browser, Node.js, Edge)
 */
export function generateRandomString(length: number = 32): string {
  if (isBrowser) {
    // Browser implementation using Web Crypto API
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else if (isNodeRuntime) {
    // Node.js implementation using crypto module
    try {
      const crypto = require('crypto');
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      // Fallback if crypto module is not available
      return fallbackRandomString(length);
    }
  } else {
    // Edge Runtime implementation (no crypto module)
    return fallbackRandomString(length);
  }
}

/**
 * Fallback random string generator that works everywhere
 * Less secure but guaranteed to work in any environment
 */
function fallbackRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length * 2; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Hashes a string using SHA-256
 * Works in all environments (Browser, Node.js, Edge)
 */
export async function sha256Hash(message: string): Promise<string> {
  if (isBrowser || isEdgeRuntime) {
    // Browser and Edge implementation using Web Crypto API
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js implementation
    try {
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(message).digest('hex');
    } catch (error) {
      // If Node.js crypto is not available, use the Web Crypto API as fallback
      const msgUint8 = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  }
}

/**
 * Generates a UUID v4
 * Works in all environments (Browser, Node.js, Edge)
 */
export function generateUUID(): string {
  if (isNodeRuntime) {
    try {
      const crypto = require('crypto');
      return crypto.randomUUID();
    } catch (error) {
      // Fallback if crypto.randomUUID is not available
      return fallbackUUID();
    }
  } else {
    // Browser or Edge implementation
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return fallbackUUID();
  }
}

/**
 * Fallback UUID generator that works everywhere
 */
function fallbackUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Encrypts text using AES-GCM
 * Works in all environments (Browser, Node.js, Edge)
 * Note: In Edge, this uses a different implementation than Node.js
 */
export async function encryptText(text: string, secretKey: string): Promise<string> {
  if (isNodeRuntime) {
    try {
      // Node.js implementation
      const crypto = require('crypto');
      const algorithm = 'aes-256-gcm';
      
      // Create a key from the secret
      const key = crypto.scryptSync(secretKey, 'salt', 32);
      
      // Create an initialization vector
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      
      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get the auth tag
      const authTag = cipher.getAuthTag();
      
      // Return iv, encrypted text, and auth tag as a single string
      return Buffer.from(JSON.stringify({
        iv: iv.toString('hex'),
        encryptedData: encrypted,
        authTag: authTag.toString('hex')
      })).toString('base64');
    } catch (error) {
      // Fallback to a simpler encryption if crypto module fails
      return fallbackEncrypt(text, secretKey);
    }
  } else {
    // Browser or Edge implementation using Web Crypto API
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      // Create a key from the secret
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
      
      // Create an initialization vector
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the text
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        data
      );
      
      // Combine iv and encrypted data
      const encryptedArray = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      encryptedArray.set(iv);
      encryptedArray.set(new Uint8Array(encryptedBuffer), iv.length);
      
      // Convert to base64
      return btoa(String.fromCharCode(...encryptedArray));
    } catch (error) {
      // Fallback to a simpler encryption if Web Crypto API fails
      return fallbackEncrypt(text, secretKey);
    }
  }
}

/**
 * Fallback encryption that works everywhere
 * This is a very simple XOR-based encryption, not secure for sensitive data
 */
function fallbackEncrypt(text: string, secretKey: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

/**
 * Decrypts text that was encrypted with encryptText
 * Works in all environments (Browser, Node.js, Edge)
 */
export async function decryptText(encryptedText: string, secretKey: string): Promise<string> {
  if (isNodeRuntime) {
    try {
      // Node.js implementation
      const crypto = require('crypto');
      const algorithm = 'aes-256-gcm';
      
      // Parse the encrypted data
      const encryptedData = JSON.parse(Buffer.from(encryptedText, 'base64').toString());
      
      // Create a key from the secret
      const key = crypto.scryptSync(secretKey, 'salt', 32);
      
      // Convert iv and auth tag from hex to Buffer
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');
      
      // Create decipher
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt the text
      let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      // Fallback to the simple decryption if crypto module fails
      return fallbackDecrypt(encryptedText, secretKey);
    }
  } else {
    // Browser or Edge implementation using Web Crypto API
    try {
      // Decode the base64 string
      const encryptedArray = new Uint8Array(
        atob(encryptedText).split('').map(char => char.charCodeAt(0))
      );
      
      // Extract iv and encrypted data
      const iv = encryptedArray.slice(0, 12);
      const encryptedData = encryptedArray.slice(12);
      
      const encoder = new TextEncoder();
      
      // Create a key from the secret
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      
      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        encryptedData
      );
      
      // Convert the decrypted data to a string
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      // Fallback to the simple decryption if Web Crypto API fails
      return fallbackDecrypt(encryptedText, secretKey);
    }
  }
}

/**
 * Fallback decryption that works everywhere
 * This is a very simple XOR-based decryption, not secure for sensitive data
 */
function fallbackDecrypt(encryptedText: string, secretKey: string): string {
  const text = atob(encryptedText);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}
