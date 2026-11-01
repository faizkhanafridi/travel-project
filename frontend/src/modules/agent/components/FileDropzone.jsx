import { useRef, useState } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { ALLOWED_DOC_TYPES, MAX_FILE_SIZE } from '../schemas';

export default function FileDropzone({
  label,
  required,
  file,
  existing,
  onFile,
  onClear,
  error,
  disabled,
}) {
  const ref = useRef(null);
  const [localError, setLocalError] = useState(null);

  const pick = () => !disabled && ref.current?.click();

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLocalError(null);

    if (!ALLOWED_DOC_TYPES.includes(f.type)) {
      setLocalError('Allowed formats: PDF, JPG, PNG, WEBP');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setLocalError('Maximum 10 MB per file');
      return;
    }
    onFile(f);
  };

  const display = file || existing;
  const fileName = file?.name || existing?.original_name;
  const sizeText = file
    ? `${(file.size / 1024).toFixed(1)} KB`
    : existing
    ? `${(existing.size_bytes / 1024).toFixed(1)} KB`
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        {existing?.locked && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Locked
          </span>
        )}
      </div>

      {display ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <FileText className="w-5 h-5 text-brand-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
            {sizeText && <p className="text-xs text-slate-500">{sizeText}</p>}
          </div>
          {!disabled && !existing?.locked && (
            <button
              type="button"
              onClick={() => {
                setLocalError(null);
                onFile(null);
                onClear?.();
              }}
              className="text-slate-400 hover:text-rose-600"
              aria-label="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={disabled}
          className={`w-full rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
            disabled
              ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
              : error
              ? 'border-rose-300 hover:border-rose-400 bg-white'
              : 'border-slate-300 hover:border-brand-400 bg-white'
          }`}
        >
          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">
            Click to upload <span className="text-slate-400">· PDF, JPG, PNG, WEBP · max 10 MB</span>
          </p>
        </button>
      )}

      <input
        ref={ref}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleChange}
        className="hidden"
      />

      {(error || localError) && (
        <p className="mt-1.5 text-xs text-rose-600">{error || localError}</p>
      )}
    </div>
  );
}