import { useRef, useState } from 'react';
import { Upload, X, Star, ArrowLeft, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { serviceService } from '../services/serviceService';

export default function GalleryUploader({
  images = [],
  onUpload,
  onReorder,
  onDelete,
  uploading = false,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [coverFile, setCoverFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  const handleCover = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
  };

  const handleExtras = (e) => {
    const files = Array.from(e.target.files || []);
    setExtraFiles((prev) => [...prev, ...files].slice(0, 10));
  };

  const submit = async () => {
    if (!coverFile) return;
    const fd = new FormData();
    fd.append('cover', coverFile);
    extraFiles.forEach((f) => fd.append('images[]', f));
    setBusy(true);
    try {
      await onUpload(fd);
      setCoverFile(null);
      setExtraFiles([]);
      if (inputRef.current) inputRef.current.value = '';
    } finally {
      setBusy(false);
    }
  };

  const move = (idx, dir) => {
    if (idx + dir < 0 || idx + dir >= images.length) return;
    const next = images.slice();
    const [item] = next.splice(idx, 1);
    next.splice(idx + dir, 0, item);
    onReorder(next);
  };

  const setCover = (uuid) => {
    const next = images.slice();
    onReorder(next, uuid);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-slate-900 mb-2">
          Cover photo <span className="text-rose-600">*</span>
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <label
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer ${
              disabled ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-300 hover:border-brand-400'
            }`}
          >
            <Upload className="w-6 h-6 text-slate-400" />
            <span className="text-sm text-slate-600">
              {coverFile ? coverFile.name : 'Select cover photo'}
            </span>
            <span className="text-xs text-slate-400">JPG/PNG/WEBP · max 5MB · min 600×400</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCover}
              disabled={disabled}
            />
          </label>

          <label
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer ${
              disabled ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-300 hover:border-brand-400'
            }`}
          >
            <Upload className="w-6 h-6 text-slate-400" />
            <span className="text-sm text-slate-600">
              {extraFiles.length > 0
                ? `${extraFiles.length} extra image${extraFiles.length > 1 ? 's' : ''} selected`
                : 'Add gallery images (max 10)'}
            </span>
            <span className="text-xs text-slate-400">Min 400×300 each</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleExtras}
              disabled={disabled}
            />
          </label>
        </div>

        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={submit}
            disabled={!coverFile || busy || disabled}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload
          </button>
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-2">
            Uploaded images ({images.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.uuid}
                className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group"
              >
                <img src={img.url} alt="" className="w-full aspect-square object-cover" />
                {img.is_cover && (
                  <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5">
                    <Star className="w-3 h-3" /> Cover
                  </span>
                )}
                {!disabled && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-around py-1">
                    <button
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="text-white disabled:opacity-30 p-1"
                      title="Move left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    {!img.is_cover && (
                      <button
                        onClick={() => setCover(img.uuid)}
                        className="text-white p-1"
                        title="Make cover"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(img.uuid)}
                      className="text-rose-300 hover:text-rose-100 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === images.length - 1}
                      className="text-white disabled:opacity-30 p-1"
                      title="Move right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}