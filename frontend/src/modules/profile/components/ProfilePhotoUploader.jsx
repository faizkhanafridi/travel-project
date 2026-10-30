import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Trash2, Upload, AlertCircle } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import { photoSchema } from '../schemas/profileSchemas';

// Resolves a possibly-relative storage URL against the API origin.
function toAbsoluteUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${base.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function ProfilePhotoUploader({
  currentUrl,
  onSelect,
  onRemove,      // optional: triggers immediate delete on backend
  disabled,
}) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [imgFailed, setImgFailed] = useState(false);
  const inputRef = useRef(null);
  const prevUrlRef = useRef(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  // Reset blob preview when the parent's currentUrl changes (after save/remove)
  useEffect(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    setPreview(null);
    setImgFailed(false);
  }, [currentUrl]);

  const handlePick = useCallback(
    (file) => {
      setError('');
      setImgFailed(false);
      const parsed = photoSchema.safeParse(file);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || 'Invalid image');
        return;
      }
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      const url = URL.createObjectURL(file);
      prevUrlRef.current = url;
      setPreview(url);
      onSelect?.(file);
    },
    [onSelect]
  );

  const handleInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handlePick(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handlePick(file);
  };

 const clearPreview = () => {
  if (prevUrlRef.current) {
    URL.revokeObjectURL(prevUrlRef.current);
    prevUrlRef.current = null;
  }
  setPreview(null);
  setImgFailed(false);
  onSelect?.(null);

  if (currentUrl) {
    onRemove?.();
  }
};

  const absoluteCurrent = toAbsoluteUrl(currentUrl);
  const shownUrl = preview || absoluteCurrent;
  const showImg = shownUrl && !imgFailed;

  return (
    <div className="flex flex-col items-center">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'relative h-32 w-32 rounded-full overflow-hidden border-2 transition-colors',
          error ? 'border-danger' : 'border-ink-200',
          disabled ? 'opacity-60' : 'hover:border-primary'
        )}
      >
        {showImg ? (
          <img
            src={shownUrl}
            alt="Profile"
            className="h-full w-full object-cover"
            onError={() => {
              setImgFailed(true);
              // eslint-disable-next-line no-console
              console.warn('[ProfilePhotoUploader] Failed to load image:', shownUrl);
            }}
          />
        ) : (
          <div className="h-full w-full grid place-items-center bg-ink-100 text-ink-500">
            {imgFailed ? <AlertCircle size={28} /> : <Camera size={28} />}
          </div>
        )}

        {!disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 grid place-items-center bg-black/0 hover:bg-black/30 text-transparent hover:text-white transition-colors"
            aria-label="Upload photo"
          >
            <Upload size={20} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInput}
        className="hidden"
        disabled={disabled}
      />

      <div className="mt-3 flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="text-primary font-semibold hover:underline disabled:text-ink-400 disabled:no-underline"
        >
          {showImg ? 'Change photo' : 'Upload photo'}
        </button>
        {(preview || currentUrl) && !disabled && (
          <button
            type="button"
            onClick={clearPreview}
            className="text-danger font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Trash2 size={12} /> Remove
          </button>
        )}
      </div>

      <p className="mt-1 text-[11px] text-ink-500 text-center">
        JPG, PNG, or WEBP · Max 5 MB
      </p>
      {error && <p className="mt-1 text-xs text-danger text-center">{error}</p>}
      {imgFailed && !preview && (
        <p className="mt-1 text-xs text-danger text-center">
          Could not load saved photo. Try uploading a new one.
        </p>
      )}
    </div>
  );
}