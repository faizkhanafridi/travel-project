import { create } from 'zustand';

export const useMessagingStore = create((set) => ({
  activeConversationUuid: null,
  setActiveConversationUuid: (uuid) => set({ activeConversationUuid: uuid }),

  // New messages received via websocket that should be appended to the open
  // conversation are pushed through this queue. The ChatWindow subscribes.
  incomingMessage: null,
  pushIncoming: (message) => set({ incomingMessage: message }),
  clearIncoming: () => set({ incomingMessage: null }),
}));