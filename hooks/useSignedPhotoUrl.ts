import { useState, useEffect } from 'react';
import { getPhotoSignedUrl } from '@/lib/trackingService';

/**
 * Resolves a Supabase storage path to a short-lived signed URL.
 * Returns null while loading or if the path is already a local URI or undefined.
 * Re-fetches automatically when storagePath changes.
 */
export function useSignedPhotoUrl(storagePath: string | undefined): string | null {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!storagePath) {
      setSignedUrl(null);
      return;
    }

    // Local URIs (during capture, before upload) are used directly — no signing needed
    if (storagePath.startsWith('file://') || storagePath.startsWith('content://')) {
      setSignedUrl(storagePath);
      return;
    }

    let cancelled = false;
    getPhotoSignedUrl(storagePath).then((url) => {
      if (!cancelled) setSignedUrl(url);
    });
    return () => { cancelled = true; };
  }, [storagePath]);

  return signedUrl;
}
