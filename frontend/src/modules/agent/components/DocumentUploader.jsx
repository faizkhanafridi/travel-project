import { useRef, useState } from 'react';
import { Upload, FileText, Trash2, Download } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import Button from '../../../shared/components/Button';
import { ALLOWED_MIMES, MAX_DOC_BYTES } from '../schemas/agentSchemas';
import { useUploadDocument } from '../hooks/useUploadDocument';
import { useDeleteDocument } from '../hooks/useDeleteDocument';
import { agentService } from '../services/agentService';

export default function DocumentUploader({
  type,
  label,
  description,
  existingDocs = [],   // array of doc resources for this type
  disabled,
  required = false,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const upload = useUploadDocument();
  const remove = useDeleteDocument();

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    if (!ALLOWED_MIMES.includes(file.type)) {
      setError('Only PDF, JPG, PNG, or WEBP allowed.');
      return;
    }
    if (file.size > MAX_DOC_BYTES) {
      setError('Max 10 MB.');
      return;
    }

    upload.mutate({ type, file });
  };

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink-900">
            {label} {required && <span className="text-danger">*</span>}
          </p>
          {description && (
            <p className="text-xs text-ink-500 mt-0.5">{description}</p>
          )}
        </div>
        {!disabled && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            loading={upload.isPending}
          >
            <Upload size={14} /> Upload
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={pick}
        className="hidden"
        disabled={disabled}
      />

      {existingDocs.length > 0 && (
        <ul className="mt-3 space-y-2">
          {existingDocs.map((doc) => (
            <li
              key={doc.uuid}
              className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="text-primary shrink-0" />
                <span className="truncate text-ink-800">
                  {doc.original_name}
                </span>
                {doc.is_approved && (
                  <span className="text-[10px] font-semibold uppercase text-success">
                    Approved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={agentService.documentDownloadUrl(doc.uuid)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                >
                  <Download size={12} /> View
                </a>
                {!disabled && !doc.is_approved && (
                  <button
                    type="button"
                    onClick={() => remove.mutate(doc.uuid)}
                    className="text-danger hover:underline inline-flex items-center gap-1 text-xs"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <p className="mt-2 text-[11px] text-ink-500">
        PDF, JPG, PNG, or WEBP · Max 10 MB
      </p>
    </div>
  );
}