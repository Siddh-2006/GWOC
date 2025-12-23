import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [
    { id: 1, text: "Hi! I'm the MindSettler guide. How can I help you today?", sender: 'bot' }
  ],
  isOpen: false,

  setChatOpen: (isOpen) => set({ isOpen }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: Date.now() }]
  })),
}));
