import crypto from 'crypto';

/** AES-256-GCM encryption algorithm */
const ALGORITHM = 'aes-256-gcm';
/** Initialization vector length (16 bytes) */
const IV_LENGTH = 16;
/** Authentication tag length (16 bytes) */
const AUTH_TAG_LENGTH = 16;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (
  !ENCRYPTION_KEY ||
  ENCRYPTION_KEY.length !== 64 ||
  !/^[0-9a-fA-F]+$/.test(ENCRYPTION_KEY)
) {
  throw new Error(
    'ENCRYPTION_KEY environment variable is missing, not 64 characters long, or not a valid hex string.'
  );
}

const key = Buffer.from(ENCRYPTION_KEY, 'hex');

/**
 * Encrypts text using AES-256-GCM.
 *
 * @param {string} text - The plaintext to encrypt
 * @returns {string} Base64 encoded string containing IV, auth tag, and ciphertext
 * @throws {Error} If encryption fails
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();
  const buffer = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);

  return buffer.toString('base64');
}

/**
 * Decrypts text encrypted with AES-256-GCM.
 *
 * @param {string} encryptedData - Base64 encoded string containing IV, auth tag, and ciphertext
 * @returns {string} The original decrypted text
 * @throws {Error} If decryption fails (wrong key, tampered data, etc.)
 */
export function decrypt(encryptedData: string): string {
  const dataBuffer = Buffer.from(encryptedData, 'base64');

  const iv = dataBuffer.subarray(0, IV_LENGTH);
  const authTag = dataBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = dataBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
