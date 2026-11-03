import { useEffect, useRef } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import {
  useConversation,
  useMessages,
  useSendMessage,
  useConversationChannel,
} from "../hooks/useMessaging";
import { messagingService } from "../services/messagingService";
import { Link } from "react-router-dom";
export default function ChatWindow({ uuid, onBack }) {
  const { data: convRes } = useConversation(uuid);
  const { data: msgRes, isLoading } = useMessages(uuid);
  const send = useSendMessage(uuid);
  const scrollRef = useRef(null);

  useConversationChannel(uuid);

  const conversation = convRes?.data;
  const messages = (msgRes?.data || [])
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const peer = conversation?.peer;
  console.log(peer)
  useEffect(() => {
    if (!uuid) return;
    messagingService.markRead(uuid).catch(() => {});
  }, [uuid, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Empty state — no conversation selected
  if (!uuid) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50">
        <div className="text-center">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 h-full">
      {/* Header */}
      <div className="flex-1 min-w-0">
        {peer?.uuid ? (
          <Link
            to={
              peer.role === "agent" ? `/agency/${peer.uuid}` : `/u/${peer.uuid}`
            }
            className="text-sm font-semibold text-slate-900 truncate hover:text-brand-700 hover:underline inline-block max-w-full"
          >
            {peer?.agency_name || peer?.name || "Conversation"}
          </Link>
        ) : (
          <p className="text-sm font-semibold text-slate-900 truncate">
            {peer?.agency_name || peer?.name || "Conversation"}
          </p>
        )}
        {conversation?.travel_service && (
          <p className="text-xs text-brand-700 truncate">
            About: {conversation.travel_service.title}
          </p>
        )}
      </div>
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
      >
        {isLoading ? (
          <div className="text-center text-sm text-slate-400 py-6">
            Loading…
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-6">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.uuid} message={m} />)
        )}
      </div>

      {/* Composer — ALWAYS rendered when uuid exists */}
      <MessageComposer
        sending={send.isPending}
        onSend={async (body) => {
          try {
            await send.mutateAsync({ body });
          } catch {
            // error handled via TanStack
          }
        }}
      />
    </div>
  );
}
