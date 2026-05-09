"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

export type ChatMessageStatus =
  | "sending"
  | "thinking"
  | "typing"
  | "done"
  | "error"
  | "cancelled";

export type ChatMessage = {
  id: string;
  clientId?: string;
  serverId?: number;
  role: "user" | "assistant";
  content: string;
  status?: ChatMessageStatus;
  chat_id?: number | null;
  created_at?: string;
};

export type ChatSummary = {
  id: string;
  title: string;
  updatedAt: number;
};

type ChatStore = {
  chats: Record<string, ChatMessage[]>;
  summaries: Record<string, ChatSummary>;
  createChat: (chatId: string, title?: string) => void;
  setChatTitle: (chatId: string, title: string) => void;
  linkChatId: (fromChatId: string, toChatId: string, title?: string) => void;
  replaceMessages: (chatId: string, messages: ChatMessage[]) => void;
  addOrUpdateMessage: (chatId: string, message: ChatMessage) => void;
  addOrUpdateMessages: (chatId: string, messages: ChatMessage[]) => void;
  addOptimisticUserMessage: (chatId: string, content: string) => ChatMessage | null;
  markUserMessageSaved: (chatId: string, payload: {
    optimisticId?: string;
    content?: string;
    created_at?: string;
    serverId?: number;
  }) => void;
  markLatestPendingUserMessageError: (chatId: string, payload?: { content?: string }) => void;
  markMessageStatus: (chatId: string, messageId: string, status: ChatMessageStatus) => void;
  updateMessageContent: (
    chatId: string,
    messageId: string,
    content: string,
    status?: ChatMessageStatus,
  ) => void;
  removeMessage: (chatId: string, messageId: string) => void;
};

const DEFAULT_CHAT_TITLE = "چت جدید";
const DUPLICATE_TIME_WINDOW_MS = 8_000;

const createSummary = (chatId: string, title = DEFAULT_CHAT_TITLE): ChatSummary => ({
  id: chatId,
  title,
  updatedAt: Date.now(),
});

const normalizeContent = (value: string) => value.trim().replace(/\s+/g, " ");

const parseTimestamp = (value?: string) => {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

const areMessagesDuplicate = (a: ChatMessage, b: ChatMessage) => {
  if (a.id && b.id && a.id === b.id) {
    return true;
  }

  if (a.serverId !== undefined && b.serverId !== undefined && a.serverId === b.serverId) {
    return true;
  }

  if (a.clientId && b.clientId && a.clientId === b.clientId) {
    return true;
  }

  if (a.role !== b.role) {
    return false;
  }

  const normalizedA = normalizeContent(a.content);
  const normalizedB = normalizeContent(b.content);

  if (!normalizedA || normalizedA !== normalizedB) {
    return false;
  }

  const aChatId = a.chat_id ?? null;
  const bChatId = b.chat_id ?? null;

  if (aChatId !== null && bChatId !== null && aChatId !== bChatId) {
    return false;
  }

  const aTime = parseTimestamp(a.created_at);
  const bTime = parseTimestamp(b.created_at);

  if (aTime === null || bTime === null) {
    return false;
  }

  return Math.abs(aTime - bTime) <= DUPLICATE_TIME_WINDOW_MS;
};

const mergeMessage = (current: ChatMessage, incoming: ChatMessage): ChatMessage => {
  const statusPriority: Record<ChatMessageStatus, number> = {
    sending: 1,
    thinking: 2,
    typing: 3,
    done: 4,
    cancelled: 5,
    error: 6,
  };
  const currentStatus = current.status ?? "done";
  const incomingStatus = incoming.status ?? currentStatus;
  const nextStatus =
    statusPriority[incomingStatus] >= statusPriority[currentStatus] ? incomingStatus : currentStatus;

  return {
    ...current,
    ...incoming,
    id: current.id || incoming.id,
    content: incoming.content || current.content,
    status: nextStatus,
    created_at: incoming.created_at ?? current.created_at,
    chat_id: incoming.chat_id ?? current.chat_id,
  };
};

const withSummary = (
  summaries: Record<string, ChatSummary>,
  chatId: string,
  title?: string,
  updatedAt = Date.now(),
) => {
  const current = summaries[chatId] ?? createSummary(chatId);

  return {
    ...summaries,
    [chatId]: {
      ...current,
      title: title?.trim() || current.title,
      updatedAt,
    },
  };
};

const upsertMessages = (existing: ChatMessage[], incoming: ChatMessage[]) => {
  const next = [...existing];

  incoming.forEach((message) => {
    const duplicateIndex = next.findIndex((item) => areMessagesDuplicate(item, message));

    if (duplicateIndex >= 0) {
      next[duplicateIndex] = mergeMessage(next[duplicateIndex], message);
      return;
    }

    next.push(message);
  });

  return dedupePreserveOrder(next);
};

const dedupePreserveOrder = (messages: ChatMessage[]) => {
  const next: ChatMessage[] = [];

  messages.forEach((message) => {
    const duplicateIndex = next.findIndex((item) => areMessagesDuplicate(item, message));

    if (duplicateIndex >= 0) {
      next[duplicateIndex] = mergeMessage(next[duplicateIndex], message);
      return;
    }

    next.push(message);
  });

  return next;
};

export const useChatStore = create<ChatStore>((set) => ({
  chats: {},
  summaries: {},

  createChat: (chatId, title) =>
    set((state) => {
      const normalizedTitle = title?.trim();
      return {
        chats: {
          ...state.chats,
          [chatId]: state.chats[chatId] ?? [],
        },
        summaries: withSummary(state.summaries, chatId, normalizedTitle),
      };
    }),

  setChatTitle: (chatId, title) => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      return;
    }

    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: state.chats[chatId] ?? [],
      },
      summaries: withSummary(state.summaries, chatId, normalizedTitle),
    }));
  },

  linkChatId: (fromChatId, toChatId, title) => {
    if (!fromChatId || !toChatId || fromChatId === toChatId) {
      return;
    }

    set((state) => {
      const fromMessages = state.chats[fromChatId] ?? [];
      const toMessages = state.chats[toChatId] ?? [];
      const merged = dedupePreserveOrder(upsertMessages(toMessages, fromMessages));

      const nextChats = {
        ...state.chats,
        [toChatId]: merged,
      };

      const nextSummaries = {
        ...state.summaries,
        [toChatId]: {
          id: toChatId,
          title:
            title?.trim() ||
            state.summaries[toChatId]?.title ||
            state.summaries[fromChatId]?.title ||
            DEFAULT_CHAT_TITLE,
          updatedAt: Date.now(),
        },
      };

      delete nextChats[fromChatId];
      delete nextSummaries[fromChatId];

      return {
        chats: nextChats,
        summaries: nextSummaries,
      };
    });
  },

  replaceMessages: (chatId, messages) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: dedupePreserveOrder(messages),
      },
      summaries: withSummary(state.summaries, chatId),
    })),

  addOrUpdateMessage: (chatId, message) =>
    set((state) => {
      const current = state.chats[chatId] ?? [];
      const nextMessages = dedupePreserveOrder(upsertMessages(current, [message]));

      return {
        chats: {
          ...state.chats,
          [chatId]: nextMessages,
        },
        summaries: withSummary(state.summaries, chatId, undefined, Date.now()),
      };
    }),

  addOrUpdateMessages: (chatId, messages) =>
    set((state) => {
      const current = state.chats[chatId] ?? [];

      return {
        chats: {
          ...state.chats,
          [chatId]: dedupePreserveOrder(upsertMessages(current, messages)),
        },
        summaries: withSummary(state.summaries, chatId, undefined, Date.now()),
      };
    }),

  addOptimisticUserMessage: (chatId, content) => {
    const normalized = content.trim();

    if (!normalized) {
      return null;
    }

    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}-${nanoid(6)}`,
      clientId: `temp-${Date.now()}-${nanoid(8)}`,
      role: "user",
      content: normalized,
      status: "sending",
      created_at: new Date().toISOString(),
      chat_id: /^\d+$/.test(chatId) ? Number(chatId) : null,
    };

    set((state) => {
      const current = state.chats[chatId] ?? [];
      const nextMessages = upsertMessages(current, [optimisticMessage]);
      const currentSummary = state.summaries[chatId];
      const nextTitle =
        currentSummary?.title && currentSummary.title !== DEFAULT_CHAT_TITLE
          ? currentSummary.title
          : normalized;

      return {
        chats: {
          ...state.chats,
          [chatId]: nextMessages,
        },
        summaries: withSummary(state.summaries, chatId, nextTitle, Date.now()),
      };
    });

    return optimisticMessage;
  },

  markUserMessageSaved: (chatId, payload) =>
    set((state) => {
      const current = [...(state.chats[chatId] ?? [])];
      const optimisticId = payload.optimisticId?.trim();
      const normalizedContent = payload.content?.trim();
      const serverId = payload.serverId;
      const resolvedChatId = /^\d+$/.test(chatId) ? Number(chatId) : null;

      let didUpdate = false;
      let optimisticIndex = -1;

      if (optimisticId) {
        optimisticIndex = current.findIndex((message) => message.id === optimisticId && message.role === "user");
      }

      if (optimisticIndex >= 0) {
        const message = current[optimisticIndex];
        current[optimisticIndex] = {
          ...message,
          status: "done",
          serverId: serverId ?? message.serverId,
          created_at: payload.created_at ?? message.created_at,
          content: normalizedContent ?? message.content,
          chat_id: resolvedChatId ?? message.chat_id ?? null,
        };
        didUpdate = true;
      }

      if (!didUpdate) {
        for (let index = current.length - 1; index >= 0; index -= 1) {
          const message = current[index];

          if (message.role !== "user") {
            continue;
          }

          if (message.status !== "sending") {
            continue;
          }

          if (normalizedContent && normalizeContent(message.content) !== normalizeContent(normalizedContent)) {
            continue;
          }

          current[index] = {
            ...message,
            status: "done",
            serverId: serverId ?? message.serverId,
            created_at: payload.created_at ?? message.created_at,
            content: normalizedContent ?? message.content,
            chat_id: resolvedChatId ?? message.chat_id ?? null,
          };
          didUpdate = true;
          break;
        }
      }

      if (!didUpdate && normalizedContent) {
        const fallbackMessage: ChatMessage = {
          id: `server-user-${serverId ?? nanoid(10)}`,
          serverId,
          role: "user",
          content: normalizedContent,
          status: "done",
          created_at: payload.created_at ?? new Date().toISOString(),
          chat_id: resolvedChatId,
        };

        const existingDuplicateIndex = current.findIndex((item) => areMessagesDuplicate(item, fallbackMessage));

        if (existingDuplicateIndex >= 0) {
          current[existingDuplicateIndex] = mergeMessage(current[existingDuplicateIndex], fallbackMessage);
        } else {
          current.push(fallbackMessage);
        }
      }

      return {
        chats: {
          ...state.chats,
          [chatId]: dedupePreserveOrder(upsertMessages([], current)),
        },
        summaries: withSummary(state.summaries, chatId, undefined, Date.now()),
      };
    }),

  markLatestPendingUserMessageError: (chatId, payload) =>
    set((state) => {
      const current = [...(state.chats[chatId] ?? [])];
      const normalizedContent = payload?.content?.trim();
      let didUpdate = false;

      for (let index = current.length - 1; index >= 0; index -= 1) {
        const message = current[index];

        if (message.role !== "user" || message.status !== "sending") {
          continue;
        }

        if (normalizedContent && normalizeContent(message.content) !== normalizeContent(normalizedContent)) {
          continue;
        }

        current[index] = {
          ...message,
          status: "error",
        };
        didUpdate = true;
        break;
      }

      if (!didUpdate) {
        return state;
      }

      return {
        chats: {
          ...state.chats,
          [chatId]: dedupePreserveOrder(current),
        },
        summaries: withSummary(state.summaries, chatId, undefined, Date.now()),
      };
    }),

  markMessageStatus: (chatId, messageId, status) =>
    set((state) => {
      const current = state.chats[chatId] ?? [];
      const next = current.map((message) =>
        message.id === messageId
          ? {
              ...message,
              status,
            }
          : message,
      );

      return {
        chats: {
          ...state.chats,
          [chatId]: next,
        },
        summaries: withSummary(state.summaries, chatId, undefined, Date.now()),
      };
    }),

  updateMessageContent: (chatId, messageId, content, status) =>
    set((state) => {
      const current = state.chats[chatId] ?? [];
      const next = current.map((message) => {
        if (message.id !== messageId) {
          return message;
        }

        return {
          ...message,
          content,
          status: status ?? message.status,
        };
      });

      return {
        chats: {
          ...state.chats,
          [chatId]: next,
        },
        summaries: withSummary(state.summaries, chatId, undefined, Date.now()),
      };
    }),

  removeMessage: (chatId, messageId) =>
    set((state) => {
      const current = state.chats[chatId] ?? [];

      return {
        chats: {
          ...state.chats,
          [chatId]: current.filter((message) => message.id !== messageId),
        },
        summaries: withSummary(state.summaries, chatId, undefined, Date.now()),
      };
    }),
}));
