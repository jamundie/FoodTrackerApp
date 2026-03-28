/**
 * Client-side AES-256-GCM encryption for meal photos.
 *
 * The key is generated once per user, stored in the device keychain via
 * expo-secure-store, and never sent to the server. Photos are encrypted
 * before upload and decrypted after download — Supabase Storage holds
 * only opaque ciphertext.
 *
 * Wire format (base64-encoded, stored as the upload body):
 *   [ 12-byte IV ][ AES-256-GCM ciphertext + 16-byte auth tag ]
 *
 * Key storage key in SecureStore: PHOTO_ENCRYPTION_KEY
 */

import QuickCrypto from 'react-native-quick-crypto';
import * as SecureStore from 'expo-secure-store';

const SECURE_STORE_KEY = 'PHOTO_ENCRYPTION_KEY';
const IV_LENGTH = 12; // bytes — standard for AES-GCM

// ── key management ────────────────────────────────────────────

/** Return the user's encryption key, generating and persisting it on first call. */
async function getOrCreateEncryptionKey(): Promise<Uint8Array> {
  const stored = await SecureStore.getItemAsync(SECURE_STORE_KEY);

  if (stored) {
    return new Uint8Array(Buffer.from(stored, 'base64'));
  }

  // Generate 32 random bytes (256-bit key) and persist in the device keychain
  const keyBytes = QuickCrypto.randomBytes(32);
  const keyBase64 = Buffer.from(keyBytes).toString('base64');
  await SecureStore.setItemAsync(SECURE_STORE_KEY, keyBase64);
  return new Uint8Array(keyBytes);
}

// ── encrypt ───────────────────────────────────────────────────

/**
 * Encrypt raw image bytes using AES-256-GCM.
 * Returns a Buffer containing: [ 12-byte IV | ciphertext+tag ]
 */
export async function encryptPhoto(plainBytes: ArrayBuffer): Promise<Buffer> {
  const keyBytes = await getOrCreateEncryptionKey();
  const iv = QuickCrypto.randomBytes(IV_LENGTH);

  // Use the synchronous createCipheriv API — avoids subtle CryptoKey type conflicts
  const cipher = QuickCrypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(keyBytes),
    iv,
  );

  const part1 = cipher.update(Buffer.from(new Uint8Array(plainBytes))) as unknown as Buffer;
  cipher.final();
  const tag = (cipher as any).getAuthTag() as unknown as Buffer;

  // Layout: [ IV (12) | ciphertext | auth tag (16) ]
  const result = Buffer.concat([iv, part1, tag]);
  return result;
}

// ── decrypt ───────────────────────────────────────────────────

const TAG_LENGTH = 16;

/**
 * Decrypt bytes previously produced by encryptPhoto.
 * Returns the original image bytes as a Buffer.
 */
export async function decryptPhoto(encryptedBytes: ArrayBuffer): Promise<Buffer> {
  const keyBytes = await getOrCreateEncryptionKey();
  // Use Uint8Array to safely handle ArrayBuffers with non-zero byteOffset
  const buf = Buffer.from(new Uint8Array(encryptedBytes));

  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(buf.length - TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH, buf.length - TAG_LENGTH);

  const decipher = QuickCrypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(keyBytes),
    iv,
  );
  (decipher as any).setAuthTag(tag);

  const part1 = decipher.update(ciphertext) as unknown as Buffer;
  const part2 = decipher.final() as unknown as Buffer;
  return Buffer.concat([part1, part2]);
}
