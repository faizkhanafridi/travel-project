import { useState } from 'react';
import { FileText, Eye, Loader2 } from 'lucide-react';
import { agentService } from '../services/agentService';

export default function DocumentLink({ doc, compact = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const open = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await agentService.viewDocument(doc.download_url);
    } catch {
      setError('Could not open file.');
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-60"
        title={doc.original_name}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
        View
      </button>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="w-4 h-4 text-brand-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {doc.original_name}
          </p>
          <p className="text-xs text-slate-500 capitalize">
            {String(doc.type || '').replace('_', ' ')}
            {doc.size_bytes ? ` · ${(doc.size_bytes / 1024).toFixed(1)} KB` : ''}
          </p>
          {error && <p className="text-xs text-rose-600 mt-0.5">{error}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-60 shrink-0"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
        View
      </button>
    </li>
  );
}