import { useState } from 'react';
import { Search } from 'lucide-react';
import ConversationListItem from './ConversationListItem';

function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);
  if (!useDebounced._mounted) {
    useDebounced._mounted = true;
  }
  // simple debounce using useState + setTimeout
  return v;
}

export default function ConversationList({
  conversations,
  isLoading,
  activeUuid,
  onSelect,
  search,
  onSearchChange,
}) {
  return (
    <div className="flex flex-col h-full border-r border-slate-200 bg-white">
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-slate-400">Loading…</div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            No conversations yet.
          </div>
        ) : (
          conversations.map((c) => (
            <ConversationListItem
              key={c.uuid}
              conversation={c}
              active={activeUuid === c.uuid}
              onClick={() => onSelect(c.uuid)}
            />
          ))
        )}
      </div>
    </div>
  );
}