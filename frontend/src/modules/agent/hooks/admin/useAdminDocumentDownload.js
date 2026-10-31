import axiosInstance from '../../../../shared/lib/axios';
import { toast } from '../../../../shared/components/Toast';

// Force-download a secured document.
export async function downloadAgentDocument(agentUuid, docUuid, filename) {
  try {
    const res = await axiosInstance.get(
      `/admin/agents/${agentUuid}/documents/${docUuid}/download`,
      { responseType: 'blob' }
    );
    const blob = new Blob([res.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'document';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    toast.error('Could not download document');
  }
}

// Open a secured document in a NEW TAB using the browser's native viewer.
// Fetches as a blob (session cookie + CSRF via axiosInstance), opens with window.open.
export async function viewAgentDocument(agentUuid, docUuid) {
  const tab = window.open('', '_blank'); // open synchronously to bypass popup blockers
  try {
    const res = await axiosInstance.get(
      `/admin/agents/${agentUuid}/documents/${docUuid}/download`,
      { responseType: 'blob' }
    );

    const contentType =
      res.headers?.['content-type'] || res.data?.type || 'application/octet-stream';

    const url = URL.createObjectURL(new Blob([res.data], { type: contentType }));

    if (tab) tab.location.href = url;
    else window.open(url, '_blank'); // fallback if tab was blocked

    // Revoke later — the new tab has its own reference to the blob.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    if (tab) tab.close();
    toast.error(
      err?.status === 403
        ? 'You do not have permission to view this document.'
        : 'Could not open document'
    );
  }
}