import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingService } from '../services/messagingService';
import { getEcho } from '../lib/echo';
import { useMessagingStore } from '../stores/messagingStore';

export function useConversations(search = '') {
  return useQuery({
    queryKey: ['messaging', 'conversations', search],
    queryFn: () => messagingService.listConversations({ search }),
    staleTime: 15_000,
  });
}

export function useConversation(uuid) {
  return useQuery({
    queryKey: ['messaging', 'conversation', uuid],
    queryFn: () => messagingService.showConversation(uuid),
    enabled: !!uuid,
  });
}

export function useMessages(uuid) {
  return useQuery({
    queryKey: ['messaging', 'messages', uuid],
    queryFn: () => messagingService.listMessages(uuid),
    enabled: !!uuid,
  });
}

export function useSendMessage(uuid) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => messagingService.sendMessage(uuid, payload),
    onSuccess: (data) => {
      qc.setQueryData(['messaging', 'messages', uuid], (prev) => {
        if (!prev?.data) return prev;
        return { ...prev, data: [...prev.data, data.data] };
      });
      qc.invalidateQueries({ queryKey: ['messaging', 'conversations'] });
    },
  });
}

export function useStartConversation() {
  return useMutation({
    mutationFn: messagingService.startConversation,
  });
}

// Subscribes to the realtime channel for the current conversation.
// Pushes incoming messages into the local store so MessageBubble can render them.
import { ensureCsrf } from '../../../lib/api';

export function useConversationChannel(uuid) {
  const qc = useQueryClient();
  const pushIncoming = useMessagingStore((s) => s.pushIncoming);

  useEffect(() => {
    if (!uuid) return;

    let cancelled = false;
    let channel = null;

    (async () => {
      await ensureCsrf().catch(() => {});
      if (cancelled) return;

      const echo = getEcho();
      channel = echo.private(`conversation.${uuid}`);
      channel.listen('.message.sent', (payload) => {
        qc.setQueryData(['messaging', 'messages', uuid], (prev) => {
          if (!prev?.data) return prev;
          if (prev.data.some((m) => m.uuid === payload.uuid)) return prev;
          return { ...prev, data: [...prev.data, payload] };
        });
        qc.invalidateQueries({ queryKey: ['messaging', 'conversations'] });
        pushIncoming(payload);
      });
    })();

    return () => {
      cancelled = true;
      if (channel) {
        try {
          channel.stopListening('.message.sent');
          getEcho().leave(`conversation.${uuid}`);
        } catch {}
      }
    };
  }, [uuid, qc, pushIncoming]);
}