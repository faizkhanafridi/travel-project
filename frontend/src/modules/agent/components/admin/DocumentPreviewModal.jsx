import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import { Download, AlertTriangle, FileText } from 'lucide-react';
import { useDocumentBlob } from '../../hooks/admin/useDocumentBlob';

export default function DocumentPreviewModal({
  open,
  onClose,
  agentUuid,
  doc,          // { uuid, original_name, mime, type }
  onDownload,   // () => void — reuse existing downloadAgentDocument
}) {
  const enabled = open && !!agentUuid && !!doc?.uuid;
  const { blobUrl, mime, error, loading } = useDocumentBlob({
    agentUuid,
    docUuid: doc?.uuid,
    enabled,
  });

  const isImage = mime?.startsWith('image/');
  const isPdf = mime === 'application/pdf';
  const isPreviewable = isImage || isPdf;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doc?.original_name || 'Document'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {onDownload && (
            <Button
              variant="outline"
              onClick={onDownload}
              disabled={loading || !!error}
            >
              <Download size={14} /> Download
            </Button>
          )}
        </div>
      }
    >
      <div className="min-h-[60vh] max-h-[70vh] overflow-auto">
        {loading && (
          <div className="h-[60vh] grid place-items-center text-sm text-ink-500">
            Loading document…
          </div>
        )}

        {!loading && error && (
          <div className="h-[60vh] grid place-items-center">
            <div className="text-center max-w-sm">
              <AlertTriangle size={28} className="mx-auto text-danger" />
              <p className="mt-3 text-sm font-semibold text-ink-900">
                Could not preview document
              </p>
              <p className="mt-1 text-xs text-ink-600">{error}</p>
              <p className="mt-3 text-xs text-ink-500">
                Try downloading it instead.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && blobUrl && isImage && (
          <img
            src={blobUrl}
            alt={doc?.original_name || 'Document'}
            className="w-full h-auto rounded-md border border-ink-200"
          />
        )}

        {!loading && !error && blobUrl && isPdf && (
          <iframe
            src={blobUrl}
            title={doc?.original_name || 'PDF preview'}
            className="w-full h-[65vh] rounded-md border border-ink-200"
          />
        )}

        {!loading && !error && blobUrl && !isPreviewable && (
          <div className="h-[60vh] grid place-items-center">
            <div className="text-center max-w-sm">
              <FileText size={28} className="mx-auto text-ink-400" />
              <p className="mt-3 text-sm font-semibold text-ink-900">
                Preview not available
              </p>
              <p className="mt-1 text-xs text-ink-600">
                This file type can&apos;t be displayed inline. Download to view.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}