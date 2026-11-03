import { useAuthStore } from '../../../stores/authStore';

export default function MessageBubble({ message }) {
  const me = useAuthStore((s) => s.user);
  const mine = message.sender?.id === me?.id;

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
          mine
            ? 'bg-brand-600 text-white rounded-br-md'
            : 'bg-slate-100 text-slate-900 rounded-bl-md'
        }`}
      >
        {!mine && message.sender?.name && (
          <p className="text-[11px] font-semibold mb-0.5 opacity-70">
            {message.sender.name}
          </p>
        )}
        <p>{message.body}</p>
        <p
          className={`text-[10px] mt-1 text-right ${
            mine ? 'text-white/70' : 'text-slate-500'
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}