export default function ConversationListItem({ conversation, active, onClick }) {
  const peer = conversation.peer;
  const last = conversation.last_message;
  const unread = conversation.unread_count || 0;

  const initials = (peer?.name || '?')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition ${
        active ? 'bg-brand-50' : 'hover:bg-slate-50'
      }`}
    >
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {peer?.agency_name || peer?.name || 'Unknown'}
          </p>
          {last?.created_at && (
            <p className="text-[11px] text-slate-400 shrink-0">
              {new Date(last.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
        {conversation.travel_service && (
          <p className="text-xs text-brand-700 truncate mt-0.5">
            {conversation.travel_service.title}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-xs truncate ${
              unread > 0 ? 'text-slate-800 font-medium' : 'text-slate-500'
            }`}
          >
            {last?.preview || 'No messages yet'}
          </p>
          {unread > 0 && (
            <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold px-1.5">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}