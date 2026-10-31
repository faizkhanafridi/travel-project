import { useEffect, useState } from 'react';
import axiosInstance from '../../../../shared/lib/axios';
import { toast } from '../../../../shared/components/Toast';

// Fetches a secured document as a blob URL, suitable for inline preview.
// Cleans up the URL on unmount or when agentUuid/docUuid changes.
export function useDocumentBlob({ agentUuid, docUuid, enabled = true }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [mime, setMime] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !agentUuid || !docUuid) return;

    let cancelled = false;
    let localUrl = null;

    setLoading(true);
    setError(null);
    setBlobUrl(null);
    setMime(null);

    (async () => {
      try {
        const res = await axiosInstance.get(
          `/admin/agents/${agentUuid}/documents/${docUuid}/download`,
          { responseType: 'blob' }
        );

        if (cancelled) return;

        // Prefer the server-provided content type; fall back to blob type.
        const contentType =
          res.headers?.['content-type'] || res.data?.type || 'application/octet-stream';

        localUrl = URL.createObjectURL(
          new Blob([res.data], { type: contentType })
        );

        setBlobUrl(localUrl);
        setMime(contentType);
      } catch (err) {
        if (cancelled) return;
        const message =
          err?.status === 403
            ? 'You do not have permission to view this document.'
            : err?.message || 'Could not load document';
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [agentUuid, docUuid, enabled]);

  return { blobUrl, mime, error, loading };
}