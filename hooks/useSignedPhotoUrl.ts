import { useState, useEffect } from 'react';
import { getDecryptedPhotoUri } from '@/lib/trackingService';

/**
 * Resolves a Supabase storage path to a decrypted local temp URI.
 * Downloads and decrypts the ciphertext on-device; returns null while loading.
 * Local file:// URIs (pre-upload) are passed through unchanged.
 */
export function useSignedPhotoUrl(storagePath: string | undefined): string | null {
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);

  useEffect(() => {
    if (!storagePath) {
      setResolvedUri(null);
      return;
    }

    // Local URIs (during capture, before upload) are used directly — no decryption needed
    if (storagePath.startsWith('file://') || storagePath.startsWith('content://')) {
      setResolvedUri(storagePath);
      return;
    }

    let cancelled = false;
    getDecryptedPhotoUri(storagePath).then((uri: string | null) => {
      if (!cancelled) setResolvedUri(uri);
    });
    return () => { cancelled = true; };
  }, [storagePath]);

  return resolvedUri;
}
