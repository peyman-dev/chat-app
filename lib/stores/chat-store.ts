"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

export type ChatMessage = {
  id: string;
  text: string;
  role: "user" | "assistant";
  createdAt: number;
};

export type ChatSummary = {
  id: string;
  title: string;
  updatedAt: number;
};

type ChatStore = {
  chats: Record<string, ChatMessage[]>;
  summaries: Record<string, ChatSummary>;
  createChat: (chatId: string) => void;
  sendMessage: (chatId: string, text: string) => void;
};

const DEFAULT_CHAT_TITLE = "چت جدید";

const createSummary = (chatId: string, title = DEFAULT_CHAT_TITLE): ChatSummary => ({
  id: chatId,
  title,
  updatedAt: Date.now(),
});

export const useChatStore = create<ChatStore>((set) => ({
  chats: {},
  summaries: {},
  createChat: (chatId) =>
    set((state) => {
      if (state.summaries[chatId]) {
        return state;
      }

      return {
        chats: {
          ...state.chats,
          [chatId]: state.chats[chatId] ?? [],
        },
        summaries: {
          ...state.summaries,
          [chatId]: createSummary(chatId),
        },
      };
    }),
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
      const currentSummary = state.summaries[chatId];
      const nextTitle =
        currentSummary?.title && currentSummary.title !== DEFAULT_CHAT_TITLE
          ? currentSummary.title
          : normalizedText;

      return {
        chats: {
          ...state.chats,
          [chatId]: [...(state.chats[chatId] ?? []), nextMessage],
        },
        summaries: {
          ...state.summaries,
          [chatId]: {
            id: chatId,
            title: nextTitle,
            updatedAt: nextMessage.createdAt,
          },
        },
      };
    });
  },
}));
