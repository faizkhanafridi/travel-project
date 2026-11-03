import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function MessageComposer({ onSend, sending }) {
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    onSend(body);
    setText('');
  };

  return (
    <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3">
      <div className="flex items-end gap-2">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit(e);
            }
          }}
          placeholder="Type a message…"
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 max-h-32"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send
        </button>
      </div>
      <p className="text-[10px] text-slate-400 mt-1">
        Enter to send · Shift + Enter for new line
      </p>
    </form>
  );
}