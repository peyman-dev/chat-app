"use client";

import { FormEvent, useMemo, useState } from "react";
import { Mic, Paperclip, Smile } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/stores/chat-store";
import IconActionButton from "./icon-action-button";
import SubmitButton from "./submit-button";

type ChatComposerProps = {
  className?: string;
};

const ChatComposer = ({ className }: ChatComposerProps) => {
  const [text, setText] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ chatId?: string | string[] }>();
  const sendMessage = useChatStore((state) => state.sendMessage);

  const activeChatId = useMemo(() => {
    const value = params?.chatId;

    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value ?? null;
  }, [params]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = text.trim();

    if (!message) {
      return;
    }

    if (pathname === "/chats") {
      const nextChatId = nanoid(14);
      sendMessage(nextChatId, message);
      setText("");
      router.push(`/chats/${nextChatId}`);
      return;
    }

    if (!activeChatId) {
      return;
    }

    sendMessage(activeChatId, message);
    setText("");
  };

  return (
    <form
      dir="ltr"
      onSubmit={handleSubmit}
      className={cn(
        "mx-auto flex w-full max-w-[1400px] items-center gap-3 rounded-[22px] border px-3 py-3 sm:px-4 sm:py-4",
        "border-[#d3dee8] bg-[#dce8f2]/95",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_24px_rgba(15,23,42,0.08)]",
        "dark:border-[#747ab0]/55 dark:bg-[#16154d]/82 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_28px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <SubmitButton disabled={!text.trim()} />

      <div
        className={cn(
          "flex min-h-[54px] flex-1 items-center gap-2 rounded-2xl px-4",
          "bg-[#f5f7f9] text-[#64748b]",
          "dark:bg-[#8f8aad] dark:text-white/75",
        )}
      >
        <div className="flex shrink-0 items-center gap-0.5">
          <IconActionButton aria-label="Insert emoji">
            <Smile className="size-5" />
          </IconActionButton>

          <IconActionButton aria-label="Attach file">
            <Paperclip className="size-5" />
          </IconActionButton>
        </div>

        <input
          dir="rtl"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="اینجا تایپ کنید..."
          className={cn(
            "h-11 flex-1 bg-transparent text-right text-base leading-none outline-none md:text-[32px]",
            "placeholder:text-[#7f8a97] dark:placeholder:text-white/82",
          )}
        />

        <button
          type="button"
          aria-label="Voice input"
          className="grid size-8 shrink-0 place-items-center rounded-full text-[#0f80cf] transition-colors hover:bg-black/5 dark:text-white/95 dark:hover:bg-white/10"
        >
          <Mic className="size-5" />
        </button>
      </div>
    </form>
  );
};

export default ChatComposer;
