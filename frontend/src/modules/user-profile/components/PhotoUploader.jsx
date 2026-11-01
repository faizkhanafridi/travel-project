import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

export default function PhotoUploader({
  currentUrl,
  onFileSelected,
  uploading = false,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelected(file);
  };

  const src = preview || currentUrl;

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 ring-4 ring-white shadow">
        {src ? (
          <img src={src} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-bold">
            ?
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-4 h-4" />
          Change photo
        </button>
        <p className="text-xs text-slate-400 mt-1.5">JPG, PNG, WEBP · max 5 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
      </div>
    </div>
  );
}