import CryptoJS from 'crypto-js';
import { config } from 'dotenv';

config();

export interface EncryptionResult {
    encrypted: string;
    iv: string;
    salt: string;
}

export interface DecryptionInput {
    encrypted: string;
    iv: string;
    salt: string;
}

export class CryptoUtil {
    private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-this-in-production';
    private static readonly ALGORITHM = 'AES';
    private static readonly MODE = CryptoJS.mode.CBC;
    private static readonly PADDING = CryptoJS.pad.Pkcs7;

    /**
     * Generate a random key for encryption
     * @param length - Length of the key in bytes (default: 32 for AES-256)
     * @returns Generated key as hex string
     */
    public static generateKey(length: number = 32): string {
        return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
    }

    /**
     * Generate a random salt
     * @param length - Length of the salt in bytes (default: 16)
     * @returns Generated salt as hex string
     */
    public static generateSalt(length: number = 16): string {
        return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
    }

    /**
     * Generate a random initialization vector (IV)
     * @param length - Length of the IV in bytes (default: 16)
     * @returns Generated IV as hex string
     */
    public static generateIV(length: number = 16): string {
        return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
    }

    /**
     * Derive a key from password using PBKDF2
     * @param password - Password to derive key from
     * @param salt - Salt for key derivation
     * @param iterations - Number of iterations (default: 10000)
     * @param keySize - Key size in words (default: 8 for 256-bit)
     * @returns Derived key
     */
    private static deriveKey(
        password: string,
        salt: string,
        iterations: number = 10000,
        keySize: number = 8
    ): CryptoJS.lib.WordArray {
        return CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
            keySize: keySize,
            iterations: iterations,
            hasher: CryptoJS.algo.SHA256
        });
    }

    /**
     * Encrypt a string using AES-256-CBC
     * @param plaintext - Text to encrypt
     * @param password - Password for encryption (optional, uses default if not provided)
     * @returns Encryption result in format: encrypted:iv:salt
     */
    public static encrypt(plaintext: string, password?: string): string {
        try {
            if (!plaintext) {
                throw new Error('Plaintext cannot be empty');
            }

            const encryptionPassword = password || this.ENCRYPTION_KEY;
            const salt = this.generateSalt();
            const iv = this.generateIV();

            // Derive key from password and salt
            const key = this.deriveKey(encryptionPassword, salt);

            // Encrypt the plaintext
            const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
                iv: CryptoJS.enc.Hex.parse(iv),
                mode: this.MODE,
                padding: this.PADDING
            });

            // Return in format: encrypted:iv:salt
            return `${encrypted.toString()}:${iv}:${salt}`;
        } catch (error) {
            throw new Error(`Encryption failed: ${(error as Error).message}`);
        }
    }

    /**
     * Decrypt a string using AES-256-CBC
     * @param encryptedData - Encrypted data in format: encrypted:iv:salt
     * @param password - Password for decryption (optional, uses default if not provided)
     * @returns Decrypted plaintext
     */
    public static decrypt(encryptedData: string, password?: string): string {
        try {
            if (!encryptedData || typeof encryptedData !== 'string') {
                throw new Error('Invalid encrypted data: must be a non-empty string');
            }

            // Parse the format: encrypted:iv:salt
            const parts = encryptedData.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid encrypted data format: expected encrypted:iv:salt');
            }

            const [encrypted, iv, salt] = parts;

            if (!encrypted || !iv || !salt) {
                throw new Error('Invalid encryption data: missing encrypted text, IV, or salt');
            }

            const decryptionPassword = password || this.ENCRYPTION_KEY;

            // Derive the same key using password and salt
            const key = this.deriveKey(decryptionPassword, salt);

            // Decrypt the data
            const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
                iv: CryptoJS.enc.Hex.parse(iv),
                mode: this.MODE,
                padding: this.PADDING
            });

            const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

            if (!plaintext) {
                throw new Error('Decryption failed: invalid password or corrupted data');
            }

            return plaintext;
        } catch (error) {
            throw new Error(`Decryption failed: ${(error as Error).message}`);
        }
    }

    /**
     * Encrypt a JavaScript object
     * @param object - Object to encrypt
     * @param password - Password for encryption (optional)
     * @returns Encryption result in format: encrypted:iv:salt
     */
    public static encryptObject(object: any, password?: string): string {
        try {
            const jsonString = JSON.stringify(object);
            return this.encrypt(jsonString, password);
        } catch (error) {
            throw new Error(`Object encryption failed: ${(error as Error).message}`);
        }
    }

    /**
     * Decrypt to a JavaScript object
     * @param encryptedData - Encrypted data in format: encrypted:iv:salt
     * @param password - Password for decryption (optional)
     * @returns Decrypted object
     */
    public static decryptToObject<T = any>(encryptedData: string, password?: string): T {
        try {
            const jsonString = this.decrypt(encryptedData, password);
            return JSON.parse(jsonString) as T;
        } catch (error) {
            throw new Error(`Object decryption failed: ${(error as Error).message}`);
        }
    }

    /**
     * Hash a string using SHA-256
     * @param input - String to hash
     * @returns SHA-256 hash as hex string
     */
    public static hash(input: string): string {
        return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
    }

    /**
     * Generate HMAC-SHA256
     * @param message - Message to create HMAC for
     * @param secret - Secret key for HMAC
     * @returns HMAC-SHA256 as hex string
     */
    public static hmac(message: string, secret?: string): string {
        const hmacSecret = secret || this.ENCRYPTION_KEY;
        return CryptoJS.HmacSHA256(message, hmacSecret).toString(CryptoJS.enc.Hex);
    }

    /**
     * Compare a plaintext with its hash (constant-time comparison)
     * @param plaintext - Original text
     * @param hash - Hash to compare against
     * @returns True if they match, false otherwise
     */
    public static compareHash(plaintext: string, hash: string): boolean {
        const computedHash = this.hash(plaintext);
        return this.constantTimeEqual(computedHash, hash);
    }

    /**
     * Constant-time string comparison to prevent timing attacks
     * @param a - First string
     * @param b - Second string
     * @returns True if strings are equal, false otherwise
     */
    private static constantTimeEqual(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }

        return result === 0;
    }

    /**
     * Generate a secure random token
     * @param length - Length of the token in bytes (default: 32)
     * @returns Random token as hex string
     */
    public static generateToken(length: number = 32): string {
        return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
    }

    /**
     * Encrypt sensitive database fields (utility for model hooks)
     * @param data - Data object with fields to encrypt
     * @param fieldsToEncrypt - Array of field names to encrypt
     * @param password - Optional password for encryption
     * @returns Data object with encrypted fields
     */
    public static encryptFields(data: any, fieldsToEncrypt: string[], password?: string): any {
        const encryptedData = { ...data };

        for (const field of fieldsToEncrypt) {
            if (encryptedData[field] && typeof encryptedData[field] === 'string') {
                const encrypted = this.encrypt(encryptedData[field], password);
                // Store the encrypted string directly (no JSON wrapping)
                encryptedData[field] = encrypted;
            }
        }

        return encryptedData;
    }

    /**
     * Decrypt sensitive database fields (utility for model hooks)
     * @param data - Data object with encrypted fields
     * @param fieldsToDecrypt - Array of field names to decrypt
     * @param password - Optional password for decryption
     * @returns Data object with decrypted fields
     */
    public static decryptFields(data: any, fieldsToDecrypt: string[], password?: string): any {
        const decryptedData = { ...data };

        for (const field of fieldsToDecrypt) {
            if (decryptedData[field] && typeof decryptedData[field] === 'string') {
                try {
                    // Check if it's in the new format (encrypted:iv:salt)
                    if (decryptedData[field].includes(':') && decryptedData[field].split(':').length === 3) {
                        decryptedData[field] = this.decrypt(decryptedData[field], password);
                    } else {
                        // Try old JSON format for backward compatibility
                        try {
                            const encryptionData = JSON.parse(decryptedData[field]);
                            if (encryptionData.encrypted && encryptionData.iv && encryptionData.salt) {
                                // Convert old format to new format
                                const oldFormatString = `${encryptionData.encrypted}:${encryptionData.iv}:${encryptionData.salt}`;
                                decryptedData[field] = this.decrypt(oldFormatString, password);
                            }
                        } catch {
                            // If it's not JSON and not new format, assume it's plain text
                            console.warn(`Field ${field} appears to be plain text, not encrypted`);
                        }
                    }
                } catch (error) {
                    // If decryption fails, the field might not be encrypted
                    console.warn(`Failed to decrypt field ${field}:`, (error as Error).message);
                }
            }
        }

        return decryptedData;
    }
}

export default CryptoUtil;
