"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { useSession } from "../stores/session-store";
import { type ChatMessage, useChatStore } from "../stores/chat-store";

type ServerPayload = {
  type?: string;
  step?: string;
  success?: boolean;
  chat_id?: number | string | null;
  title?: string;
  message?: string;
  answer?: string;
  [key: string]: unknown;
};

type ChatHistoryEvent = {
  type: "chat_history";
  success: boolean;
  data: {
    chat_id: number;
    chat_title: string;
    created_at: string;
    updated_at: string;
    messages: {
      id: number;
      role: "user" | "assistant";
      content: string;
      created_at: string;
    }[];
    pagination: {
      current_page: number;
      page_size: number;
      total_count: number;
      total_pages: number;
    };
  };
};

type SendMessageInput = {
  message: string;
  chatId?: string | null;
};

type AssistantState = "idle" | "processing" | "typing";

type ChatWebSocketValue = {
  sendMessage: (input: SendMessageInput) => boolean;
  stopGeneration: () => void;
  isConnected: boolean;
  isHistoryLoading: boolean;
  assistantState: AssistantState;
  isAssistantBusy: boolean;
  errorMessage: string | null;
};

const ChatWebSocketContext = createContext<ChatWebSocketValue | null>(null);

const PROCESSING_TEXT = "در حال فکر کردن...";
const STOPPED_TEXT = "تولید پاسخ متوقف شد.";
const GENERIC_ERROR_TEXT = "متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.";
const TYPING_INTERVAL_MS = 42;
const NEW_CHAT_LOCAL_KEY = "__new_chat__";

const parseRouteChatId = (value: string | string[] | undefined): string | null => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

const normalizeChatId = (value: unknown): string | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
};

const extractIncomingChatId = (payload: ServerPayload): string | null => {
  const payloadData = asRecord(payload.data);
  return normalizeChatId(payload.chat_id ?? payloadData?.chat_id ?? null);
};

const toServerChatId = (chatId: string | null | undefined): number | null => {
  if (!chatId) {
    return null;
  }

  const trimmed = chatId.trim();

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  return Number(trimmed);
};

const buildWsUrl = (baseUrl: string, token: string, chatId: string | null) => {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const endpoint = chatId
    ? `${normalizedBase}/${encodeURIComponent(chatId)}/`
    : `${normalizedBase}/`;

  return `${endpoint}?token=${encodeURIComponent(token)}`;
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
};

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const inferRole = (value: unknown): ChatMessage["role"] | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.toLowerCase();

  if (normalized.includes("assistant") || normalized.includes("ai") || normalized.includes("bot")) {
    return "assistant";
  }

  if (normalized.includes("user") || normalized.includes("human")) {
    return "user";
  }

  return null;
};

const toChatMessage = (
  input: {
    id?: string;
    role: ChatMessage["role"];
    content: string;
    chatId: string | null;
    createdAt?: string;
  },
  index: number,
) => {
  const content = input.content.trim();

  if (!content) {
    return null;
  }

  return {
    id: input.id || `history-${input.role}-${index}-${nanoid(8)}`,
    role: input.role,
    content,
    status: "done" as const,
    chat_id: toServerChatId(input.chatId),
    created_at: input.createdAt,
  } satisfies ChatMessage;
};

const normalizeHistoryItem = (
  item: unknown,
  fallbackChatId: string | null,
  index: number,
): ChatMessage[] => {
  const record = asRecord(item);

  if (!record) {
    return [];
  }

  const chatId = normalizeChatId(record.chat_id ?? record.chatId ?? fallbackChatId);
  const createdAt = firstString(record.created_at, record.createdAt, record.timestamp, record.time);
  const messageId = firstString(record.id, record.message_id, record.messageId);
  const role = inferRole(record.role ?? record.sender ?? record.from ?? record.actor ?? record.type);

  if (role) {
    const roleBasedContent =
      role === "assistant"
        ? firstString(record.content, record.answer, record.response, record.text, record.message)
        : firstString(record.content, record.message, record.text, record.question, record.prompt);

    const normalized = toChatMessage(
      {
        id: messageId,
        role,
        content: roleBasedContent,
        chatId,
        createdAt,
      },
      index,
    );

    return normalized ? [normalized] : [];
  }

  const userContent = firstString(
    record.user_message,
    record.user,
    record.question,
    record.prompt,
    record.message,
    record.text,
  );
  const assistantContent = firstString(
    record.assistant_message,
    record.assistant,
    record.answer,
    record.response,
    record.reply,
  );

  const normalizedMessages: ChatMessage[] = [];

  const normalizedUser = toChatMessage(
    {
      id: messageId ? `${messageId}-user` : "",
      role: "user",
      content: userContent,
      chatId,
      createdAt,
    },
    index,
  );

  if (normalizedUser) {
    normalizedMessages.push(normalizedUser);
  }

  const normalizedAssistant = toChatMessage(
    {
      id: messageId ? `${messageId}-assistant` : "",
      role: "assistant",
      content: assistantContent,
      chatId,
      createdAt,
    },
    index + 1,
  );

  if (normalizedAssistant) {
    normalizedMessages.push(normalizedAssistant);
  }

  return normalizedMessages;
};

const extractHistoryMessages = (payload: ServerPayload, fallbackChatId: string | null): ChatMessage[] => {
  const directCandidates: unknown[] = [];

  if (Array.isArray(payload.history)) {
    directCandidates.push(...payload.history);
  }

  if (Array.isArray(payload.messages)) {
    directCandidates.push(...payload.messages);
  }

  const payloadData = asRecord(payload.data);

  if (payloadData) {
    if (Array.isArray(payloadData.history)) {
      directCandidates.push(...payloadData.history);
    }

    if (Array.isArray(payloadData.messages)) {
      directCandidates.push(...payloadData.messages);
    }

    if (Array.isArray(payloadData.items)) {
      directCandidates.push(...payloadData.items);
    }
  }

  return directCandidates.flatMap((item, index) => normalizeHistoryItem(item, fallbackChatId, index));
};

const isChatHistoryEvent = (payload: ServerPayload): payload is ChatHistoryEvent => {
  if (payload.type !== "chat_history") {
    return false;
  }

  const data = asRecord(payload.data);

  return Boolean(data && Array.isArray(data.messages) && typeof data.chat_id === "number");
};

const tokenizeForTyping = (value: string) => {
  const normalized = value.trim();

  if (!normalized) {
    return [];
  }

  return normalized.split(/(\s+)/).filter((token) => token.length > 0);
};

const sortByCreatedAtAscending = <T extends { created_at?: string }>(messages: T[]) => {
  return [...messages].sort((a, b) => {
    const aTime = new Date(a.created_at ?? 0).getTime();
    const bTime = new Date(b.created_at ?? 0).getTime();
    return aTime - bTime;
  });
};

const useChatWebSocketInternal = (): ChatWebSocketValue => {
  const { session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ chatId?: string | string[] }>();
  const queryClient = useQueryClient();

  const createChat = useChatStore((state) => state.createChat);
  const setChatTitle = useChatStore((state) => state.setChatTitle);
  const linkChatId = useChatStore((state) => state.linkChatId);
  const replaceMessages = useChatStore((state) => state.replaceMessages);
  const addOrUpdateMessage = useChatStore((state) => state.addOrUpdateMessage);
  const addOrUpdateMessages = useChatStore((state) => state.addOrUpdateMessages);
  const addOptimisticUserMessage = useChatStore((state) => state.addOptimisticUserMessage);
  const markUserMessageSaved = useChatStore((state) => state.markUserMessageSaved);
  const updateMessageContent = useChatStore((state) => state.updateMessageContent);

  const routeChatId = useMemo(() => parseRouteChatId(params?.chatId), [params]);
  const serverRouteChatId = useMemo(
    () => (routeChatId && /^\d+$/.test(routeChatId) ? routeChatId : null),
    [routeChatId],
  );

  const wsRef = useRef<WebSocket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const assistantMessageIdRef = useRef<string | null>(null);
  const assistantChatIdRef = useRef<string | null>(null);
  const pendingLocalChatIdRef = useRef<string | null>(null);
  const activeChatIdRef = useRef<string | null>(routeChatId);
  const historyLoadedRef = useRef<Record<string, boolean>>({});
  const ignoreNextAssistantMessageRef = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAssistantBusy = assistantState === "processing" || assistantState === "typing";

  const setActiveChatId = useCallback((chatId: string | null) => {
    activeChatIdRef.current = chatId;
  }, []);

  useLayoutEffect(() => {
    setActiveChatId(routeChatId);
  }, [routeChatId, setActiveChatId]);

  const resetAssistantRuntime = useCallback(() => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    assistantMessageIdRef.current = null;
    assistantChatIdRef.current = null;
  }, []);

  const finalizeAssistantMessage = useCallback(
    (status: "done" | "cancelled" | "error", fallbackText?: string) => {
      const chatId = assistantChatIdRef.current;
      const messageId = assistantMessageIdRef.current;

      if (!chatId || !messageId) {
        return;
      }

      const messages = useChatStore.getState().chats[chatId] ?? [];
      const current = messages.find((item) => item.id === messageId);

      const finalContent = current?.content?.trim() || fallbackText || "";

      updateMessageContent(chatId, messageId, finalContent, status);
    },
    [updateMessageContent],
  );

  const ensureAssistantMessage = useCallback(
    (chatId: string, status: ChatMessage["status"], content = "") => {
      const existingChat = assistantChatIdRef.current;
      const existingMessageId = assistantMessageIdRef.current;

      if (existingChat === chatId && existingMessageId) {
        updateMessageContent(chatId, existingMessageId, content, status);
        return existingMessageId;
      }

      const nextMessageId = `assistant-live-${nanoid(10)}`;

      createChat(chatId);
      addOrUpdateMessage(chatId, {
        id: nextMessageId,
        role: "assistant",
        content,
        status,
        chat_id: toServerChatId(chatId),
        created_at: new Date().toISOString(),
      });

      assistantChatIdRef.current = chatId;
      assistantMessageIdRef.current = nextMessageId;

      return nextMessageId;
    },
    [addOrUpdateMessage, createChat, updateMessageContent],
  );

  const setAssistantIdle = useCallback(() => {
    setAssistantState("idle");
    resetAssistantRuntime();
  }, [resetAssistantRuntime]);

  const handleHistoryLoaded = useCallback(
    (payload: ServerPayload, targetChatId: string) => {
      const historyMessages = sortByCreatedAtAscending(extractHistoryMessages(payload, targetChatId));

      if (historyMessages.length === 0) {
        historyLoadedRef.current[targetChatId] = true;
        return;
      }

      const existingMessages = useChatStore.getState().chats[targetChatId] ?? [];
      const shouldMergeWithExisting = existingMessages.length > 0;

      if (!historyLoadedRef.current[targetChatId] && !shouldMergeWithExisting) {
        replaceMessages(targetChatId, historyMessages);
      } else {
        addOrUpdateMessages(targetChatId, historyMessages);
      }

      historyLoadedRef.current[targetChatId] = true;
    },
    [addOrUpdateMessages, replaceMessages],
  );

  const startTypingAnimation = useCallback(
    (chatId: string, answer: string) => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }

      const messageId = ensureAssistantMessage(chatId, "typing", "");
      const tokens = tokenizeForTyping(answer);

      if (tokens.length === 0) {
        updateMessageContent(chatId, messageId, "", "done");
        setAssistantIdle();
        return;
      }

      setAssistantState("typing");

      let cursor = 0;
      typingTimerRef.current = setInterval(() => {
        cursor += 1;
        const nextText = tokens.slice(0, cursor).join("");
        const isFinished = cursor >= tokens.length;

        updateMessageContent(chatId, messageId, nextText, isFinished ? "done" : "typing");

        if (isFinished) {
          if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
          }

          setAssistantIdle();
        }
      }, TYPING_INTERVAL_MS);
    },
    [ensureAssistantMessage, setAssistantIdle, updateMessageContent],
  );

  const stopGeneration = useCallback(() => {
    const ws = wsRef.current;
    const chatId = assistantChatIdRef.current || routeChatId || pendingLocalChatIdRef.current;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "cancel",
          action: "stop_generation",
          chat_id: toServerChatId(chatId),
        }),
      );
    }

    if (isAssistantBusy) {
      ignoreNextAssistantMessageRef.current = true;
    }

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    const messageId = assistantMessageIdRef.current;
    const assistantChatId = assistantChatIdRef.current;

    if (assistantChatId && messageId) {
      const messages = useChatStore.getState().chats[assistantChatId] ?? [];
      const message = messages.find((item) => item.id === messageId);
      const nextContent = message?.content?.trim() || STOPPED_TEXT;
      updateMessageContent(assistantChatId, messageId, nextContent, "cancelled");
    }

    setAssistantIdle();
  }, [isAssistantBusy, routeChatId, setAssistantIdle, updateMessageContent]);

  useEffect(() => {
    const token = session?.access;
    const baseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL;

    if (!token || !baseUrl) {
      return;
    }

    const wsUrl = buildWsUrl(baseUrl, token, serverRouteChatId);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    if (routeChatId) {
      createChat(routeChatId);
      pendingLocalChatIdRef.current = routeChatId;
    }

    ws.onopen = () => {
      if (serverRouteChatId) {
        console.log(`[WS] connected to existing chat ${serverRouteChatId}: ${wsUrl}`);
      }
      setIsHistoryLoading(Boolean(serverRouteChatId));
      setIsConnected(true);
      setErrorMessage(null);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setErrorMessage(GENERIC_ERROR_TEXT);
      setIsHistoryLoading(false);
    };

    ws.onmessage = (event) => {
      if (serverRouteChatId) {
        console.log(`[WS] message for chat ${serverRouteChatId}:`, event.data);
      }

      let payload: ServerPayload;

      try {
        payload = JSON.parse(event.data) as ServerPayload;
      } catch {
        return;
      }

      const type = typeof payload.type === "string" ? payload.type : "";
      const step = typeof payload.step === "string" ? payload.step : "";

      const incomingChatId = extractIncomingChatId(payload);
      const resolvedChatId =
        incomingChatId || serverRouteChatId || activeChatIdRef.current || pendingLocalChatIdRef.current;
      const title = firstString(payload.title);

      if (incomingChatId) {
        const previousChatId = activeChatIdRef.current || pendingLocalChatIdRef.current;
        const hasActiveServerChatId = Boolean(toServerChatId(activeChatIdRef.current));

        if (
          previousChatId &&
          previousChatId !== incomingChatId &&
          !/^\d+$/.test(previousChatId)
        ) {
          linkChatId(previousChatId, incomingChatId, title || undefined);
        } else {
          createChat(incomingChatId, title || undefined);
        }

        pendingLocalChatIdRef.current = incomingChatId;
        setActiveChatId(incomingChatId);

        if (!hasActiveServerChatId && pathname === "/chats") {
          router.push(`/chats/${incomingChatId}`);
        }
      }

      if (type === "connection") {
        setIsConnected(Boolean(payload.success));
        return;
      }

      if (isChatHistoryEvent(payload)) {
        const historyChatId = String(payload.data.chat_id);
        const historyTitle = payload.data.chat_title?.trim();

        const normalizedMessages: ChatMessage[] = sortByCreatedAtAscending(
          payload.data.messages.map((message) => ({
            id: String(message.id),
            serverId: message.id,
            role: message.role,
            content: message.content,
            status: "done",
            chat_id: payload.data.chat_id,
            created_at: message.created_at,
          })),
        );

        createChat(historyChatId, historyTitle || undefined);

        const existingMessages = useChatStore.getState().chats[historyChatId] ?? [];
        const shouldMergeWithExisting = existingMessages.length > 0;

        if (!historyLoadedRef.current[historyChatId] && !shouldMergeWithExisting) {
          replaceMessages(historyChatId, normalizedMessages);
        } else {
          addOrUpdateMessages(historyChatId, normalizedMessages);
        }

        if (historyTitle) {
          setChatTitle(historyChatId, historyTitle);
        }

        pendingLocalChatIdRef.current = historyChatId;
        setActiveChatId(historyChatId);
        historyLoadedRef.current[historyChatId] = true;
        setIsHistoryLoading(false);

        if (pathname.startsWith("/chats") && routeChatId !== historyChatId) {
          router.push(`/chats/${historyChatId}`);
        }

        return;
      }

      if (type === "debug") {
        const debugIsChatReady = step === "chat_ready";
        const debugIsHistory = step === "history_loaded";

        if (debugIsChatReady && incomingChatId) {
          const pendingChatId = pendingLocalChatIdRef.current;

          if (pendingChatId && pendingChatId !== incomingChatId) {
            linkChatId(pendingChatId, incomingChatId, title || undefined);
            if (pathname.startsWith("/chats")) {
              router.push(`/chats/${incomingChatId}`);
            }
          } else {
            createChat(incomingChatId, title || undefined);
          }

          if (title) {
            setChatTitle(incomingChatId, title);
          }

          pendingLocalChatIdRef.current = incomingChatId;
          setActiveChatId(incomingChatId);
        }

        if (debugIsHistory && resolvedChatId) {
          handleHistoryLoaded(payload, resolvedChatId);
          setIsHistoryLoading(false);
        }

        return;
      }

      if (type === "chat_ready" && incomingChatId) {
        const pendingChatId = pendingLocalChatIdRef.current;

        if (pendingChatId && pendingChatId !== incomingChatId) {
          linkChatId(pendingChatId, incomingChatId, title || undefined);

          if (pathname.startsWith("/chats")) {
            router.push(`/chats/${incomingChatId}`);
          }
        } else {
          createChat(incomingChatId, title || undefined);
        }

        if (title) {
          setChatTitle(incomingChatId, title);
        }

        pendingLocalChatIdRef.current = incomingChatId;
        setActiveChatId(incomingChatId);
        queryClient.invalidateQueries({ queryKey: ["recent-chats"] });
        return;
      }

      if (type === "history_loaded" && resolvedChatId) {
        handleHistoryLoaded(payload, resolvedChatId);
        setIsHistoryLoading(false);
        return;
      }

      if (type === "user_message_saved" && resolvedChatId) {
        const content = firstString(payload.message);
        markUserMessageSaved(resolvedChatId, {
          content,
          created_at: firstString(payload.created_at, payload.createdAt, payload.timestamp),
        });

        if (title) {
          setChatTitle(resolvedChatId, title);
        }

        queryClient.invalidateQueries({ queryKey: ["recent-chats"] });
        return;
      }

      if (type === "processing" && resolvedChatId) {
        const currentChatId = activeChatIdRef.current || pendingLocalChatIdRef.current;

        if (currentChatId && resolvedChatId !== currentChatId) {
          return;
        }

        setErrorMessage(null);
        setAssistantState("processing");
        ensureAssistantMessage(resolvedChatId, "thinking", PROCESSING_TEXT);
        return;
      }

      if (type === "assistant_message" && resolvedChatId) {
        const currentChatId = activeChatIdRef.current || pendingLocalChatIdRef.current;

        if (currentChatId && resolvedChatId !== currentChatId) {
          return;
        }

        if (ignoreNextAssistantMessageRef.current) {
          ignoreNextAssistantMessageRef.current = false;
          setAssistantIdle();
          return;
        }

        setErrorMessage(null);

        if (title) {
          setChatTitle(resolvedChatId, title);
        }

        const answer = firstString(payload.answer);

        if (!answer) {
          finalizeAssistantMessage("error", GENERIC_ERROR_TEXT);
          setErrorMessage(GENERIC_ERROR_TEXT);
          setAssistantIdle();
          return;
        }

        startTypingAnimation(resolvedChatId, answer);

        queryClient.invalidateQueries({ queryKey: ["recent-chats"] });
        return;
      }

      if (type === "error") {
        const message = firstString(payload.message, payload.detail, payload.error) || GENERIC_ERROR_TEXT;
        setErrorMessage(message);
        finalizeAssistantMessage("error", message);
        setIsHistoryLoading(false);
        setAssistantIdle();
      }
    };

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }

      setAssistantState("idle");
      resetAssistantRuntime();

      ws.close();

      if (wsRef.current === ws) {
        wsRef.current = null;
      }

      setIsConnected(false);
      setIsHistoryLoading(false);
    };
  }, [
    addOrUpdateMessages,
    createChat,
    finalizeAssistantMessage,
    handleHistoryLoaded,
    linkChatId,
    markUserMessageSaved,
    pathname,
    queryClient,
    replaceMessages,
    routeChatId,
    serverRouteChatId,
    router,
    session?.access,
    setAssistantIdle,
    setChatTitle,
    startTypingAnimation,
    ensureAssistantMessage,
    resetAssistantRuntime,
    setActiveChatId,
  ]);

  const sendMessage = useCallback(
    ({ message, chatId }: SendMessageInput) => {
      if (isAssistantBusy) {
        return false;
      }

      const normalizedMessage = message.trim();

      if (!normalizedMessage) {
        return false;
      }

      const ws = wsRef.current;

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        setErrorMessage("ارتباط وب‌سوکت برقرار نیست.");
        return false;
      }

      const targetChatId =
        chatId?.trim() ||
        routeChatId ||
        pendingLocalChatIdRef.current ||
        (pathname === "/chats" ? NEW_CHAT_LOCAL_KEY : null);

      if (!targetChatId) {
        setErrorMessage("شناسه گفتگو نامعتبر است.");
        return false;
      }

      setErrorMessage(null);
      ignoreNextAssistantMessageRef.current = false;
      pendingLocalChatIdRef.current = targetChatId;
      setActiveChatId(targetChatId);

      createChat(targetChatId);
      addOptimisticUserMessage(targetChatId, normalizedMessage);

      ws.send(
        JSON.stringify({
          message: normalizedMessage,
          chat_id: toServerChatId(targetChatId),
        }),
      );

      return true;
    },
    [addOptimisticUserMessage, createChat, isAssistantBusy, pathname, routeChatId, setActiveChatId],
  );

  return useMemo(
    () => ({
      sendMessage,
      stopGeneration,
      isConnected,
      isHistoryLoading,
      assistantState,
      isAssistantBusy,
      errorMessage,
    }),
    [
      assistantState,
      errorMessage,
      isAssistantBusy,
      isConnected,
      isHistoryLoading,
      sendMessage,
      stopGeneration,
    ],
  );
};

export const ChatWebSocketProvider = ({ children }: { children: ReactNode }) => {
  const value = useChatWebSocketInternal();
  return <ChatWebSocketContext.Provider value={value}>{children}</ChatWebSocketContext.Provider>;
};

export function useChatWebSocket() {
  const context = useContext(ChatWebSocketContext);

  if (!context) {
    throw new Error("useChatWebSocket must be used within ChatWebSocketProvider");
  }

  return context;
}
