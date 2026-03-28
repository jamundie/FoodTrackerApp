/**
 * Tests for utils/photoEncryption.ts
 *
 * react-native-quick-crypto and expo-secure-store are native modules unavailable
 * in Jest/Node. We mock quick-crypto with Node's built-in `crypto` module so the
 * AES-256-GCM logic is exercised for real, and mock SecureStore with an in-memory
 * store so key persistence is testable without a device keychain.
 */

import nodeCrypto from 'crypto';

// ── mock react-native-quick-crypto using Node crypto ─────────────────────────

jest.mock('react-native-quick-crypto', () => {
  const nodeCrypto = require('crypto');

  return {
    default: {
      randomBytes: (size: number) => nodeCrypto.randomBytes(size),
      createCipheriv: (algo: string, key: Buffer, iv: Buffer) =>
        nodeCrypto.createCipheriv(algo, key, iv),
      createDecipheriv: (algo: string, key: Buffer, iv: Buffer) =>
        nodeCrypto.createDecipheriv(algo, key, iv),
    },
    randomBytes: (size: number) => nodeCrypto.randomBytes(size),
    createCipheriv: (algo: string, key: Buffer, iv: Buffer) =>
      nodeCrypto.createCipheriv(algo, key, iv),
    createDecipheriv: (algo: string, key: Buffer, iv: Buffer) =>
      nodeCrypto.createDecipheriv(algo, key, iv),
  };
});

// ── mock expo-secure-store with an in-memory map ─────────────────────────────

const secureStore: Record<string, string> = {};

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) => Promise.resolve(secureStore[key] ?? null)),
  setItemAsync: jest.fn((key: string, value: string) => {
    secureStore[key] = value;
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key: string) => {
    delete secureStore[key];
    return Promise.resolve();
  }),
}));

// ── import after mocks are in place ──────────────────────────────────────────

import { encryptPhoto, decryptPhoto } from '../photoEncryption';
import * as SecureStore from 'expo-secure-store';

// ── helpers ───────────────────────────────────────────────────────────────────

function makePayload(text: string): ArrayBuffer {
  const bytes = Buffer.from(text, 'utf8');
  // Allocate a fresh ArrayBuffer to avoid Node Buffer pool offset issues
  const ab = new ArrayBuffer(bytes.length);
  new Uint8Array(ab).set(bytes);
  return ab;
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('photoEncryption', () => {
  beforeEach(() => {
    // Clear the in-memory SecureStore and all mock call records before each test
    Object.keys(secureStore).forEach((k) => delete secureStore[k]);
    jest.clearAllMocks();
  });

  describe('encryptPhoto / decryptPhoto round-trip', () => {
    it('decrypted output matches original plaintext', async () => {
      const original = makePayload('hello encrypted world');
      const encrypted = await encryptPhoto(original);
      // Copy to a fresh ArrayBuffer to avoid Node Buffer pool offset issues
      const encAb = new ArrayBuffer(encrypted.length);
      new Uint8Array(encAb).set(encrypted);
      const decrypted = await decryptPhoto(encAb);
      expect(Buffer.from(decrypted).toString('utf8')).toBe('hello encrypted world');
    });

    it('round-trips arbitrary binary data', async () => {
      const original = nodeCrypto.randomBytes(256);
      const originalAb = new ArrayBuffer(original.length);
      new Uint8Array(originalAb).set(original);

      const encrypted = await encryptPhoto(originalAb);
      const encAb = new ArrayBuffer(encrypted.length);
      new Uint8Array(encAb).set(encrypted);
      const decrypted = await decryptPhoto(encAb);

      expect(Buffer.compare(Buffer.from(decrypted), original)).toBe(0);
    });

    it('produces different ciphertext each call (IV randomness)', async () => {
      const payload = makePayload('same plaintext');
      const enc1 = await encryptPhoto(payload);
      const enc2 = await encryptPhoto(payload);
      // Ciphertexts should differ because each gets a fresh random IV
      expect(enc1.toString('hex')).not.toBe(enc2.toString('hex'));
    });

    it('ciphertext is longer than plaintext by IV + tag overhead', async () => {
      const payload = makePayload('test data');
      const encrypted = await encryptPhoto(payload);
      // IV = 12 bytes, auth tag = 16 bytes → total overhead = 28 bytes
      expect(encrypted.byteLength).toBe(payload.byteLength + 12 + 16);
    });
  });

  describe('ciphertext integrity', () => {
    it('throws when ciphertext is tampered', async () => {
      const payload = makePayload('sensitive data');
      const encrypted = await encryptPhoto(payload);

      // Flip a byte in the ciphertext body (past the 12-byte IV, before the 16-byte tag)
      encrypted[20] ^= 0xff;

      const encAb = new ArrayBuffer(encrypted.length);
      new Uint8Array(encAb).set(encrypted);
      await expect(decryptPhoto(encAb)).rejects.toThrow();
    });

    it('throws when the auth tag is tampered', async () => {
      const payload = makePayload('sensitive data');
      const encrypted = await encryptPhoto(payload);

      // Corrupt the last byte of the auth tag
      encrypted[encrypted.byteLength - 1] ^= 0xff;

      const encAb = new ArrayBuffer(encrypted.length);
      new Uint8Array(encAb).set(encrypted);
      await expect(decryptPhoto(encAb)).rejects.toThrow();
    });
  });

  describe('key persistence', () => {
    it('generates and stores a key on first call', async () => {
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();

      await encryptPhoto(makePayload('test'));

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('PHOTO_ENCRYPTION_KEY');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'PHOTO_ENCRYPTION_KEY',
        expect.any(String),
      );
    });

    it('reuses the stored key on subsequent calls', async () => {
      await encryptPhoto(makePayload('first call'));
      jest.clearAllMocks(); // reset call counts; key is still in secureStore

      await encryptPhoto(makePayload('second call'));

      // Key was read from store — setItemAsync should NOT be called again
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('PHOTO_ENCRYPTION_KEY');
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('encrypt on one call and decrypt on another both use the same persisted key', async () => {
      const payload = makePayload('cross-call consistency');
      const encrypted = await encryptPhoto(payload);

      // Simulate a fresh module invocation by clearing mock call counts only
      // (secureStore retains the key, as it would across app operations)
      jest.clearAllMocks();

      const encAb = new ArrayBuffer(encrypted.length);
      new Uint8Array(encAb).set(encrypted);
      const decrypted = await decryptPhoto(encAb);
      expect(Buffer.from(decrypted).toString('utf8')).toBe('cross-call consistency');
    });
  });
});
