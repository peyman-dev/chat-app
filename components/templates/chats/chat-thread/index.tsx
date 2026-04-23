"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useChatStore } from "@/lib/stores/chat-store";

const EMPTY_MESSAGES: ReturnType<typeof useChatStore.getState>["chats"][string] = [];

const ChatThread = () => {
  const params = useParams<{ chatId?: string | string[] }>();

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

  return (
    <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col px-6 pb-44 pt-8">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div key={message.id} className="flex justify-end">
              <p className="max-w-[80%] rounded-2xl bg-panel-strong px-4 py-3 text-base text-foreground shadow-sm">
                {message.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatThread;
