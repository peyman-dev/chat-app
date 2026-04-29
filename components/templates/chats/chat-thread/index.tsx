"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import ChatMessage from "@/components/templates/chats/chat-thread/chat-message";
import { useChatStore } from "@/lib/stores/chat-store";

const EMPTY_MESSAGES: ReturnType<typeof useChatStore.getState>["chats"][string] = [];

const ChatThread = () => {
  const params = useParams<{ chatId?: string | string[] }>();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const hasInitialScroll = useRef(false);

  const activeChatId = useMemo(() => {
    const value = params?.chatId;

    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value ?? null;
  }, [params]);

  const messages = useChatStore((state) =>
    activeChatId ? (state.chats[activeChatId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES,
  );
  const scrollSignature = useMemo(
    () =>
      messages
        .map((message) => `${message.id}:${message.status ?? "done"}:${message.content.length}`)
        .join("|"),
    [messages],
  );

  useEffect(() => {
    const node = scrollRef.current;

    if (!node) {
      return;
    }

    const behavior = hasInitialScroll.current ? "smooth" : "auto";

    node.scrollTo({
      top: node.scrollHeight,
      behavior,
    });

    hasInitialScroll.current = true;
  }, [activeChatId, messages.length, scrollSignature]);

  return (
    <div className="mx-auto flex h-full w-full  flex-col px-4 pb-44  sm:px-6 lg:px-8">
      <div ref={scrollRef} className="chats-scrollbar flex-1 overflow-y-auto">
        <div className="flex flex-col px-1 pb-8 sm:px-2">
          {messages.map((message, index) => {
            const previous = messages[index - 1];
            const groupedWithPrevious = previous?.role === message.role;

            return (
              <ChatMessage
                key={message.id}
                message={message}
                groupedWithPrevious={groupedWithPrevious}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatThread;
