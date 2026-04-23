"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

export type ChatMessage = {
  id: string;
  text: string;
  role: "user";
  createdAt: number;
};

type ChatStore = {
  chats: Record<string, ChatMessage[]>;
  sendMessage: (chatId: string, text: string) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  chats: {},
  sendMessage: (chatId, text) => {
    const normalizedText = text.trim();

    if (!normalizedText) {
      return;
    }

    set((state) => {
      const nextMessage: ChatMessage = {
        id: nanoid(10),
        text: normalizedText,
        role: "user",
        createdAt: Date.now(),
      };

      return {
        chats: {
          ...state.chats,
          [chatId]: [...(state.chats[chatId] ?? []), nextMessage],
        },
      };
    });
  },
}));
