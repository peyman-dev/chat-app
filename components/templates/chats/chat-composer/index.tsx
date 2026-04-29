"use client";

import { FormEvent, useMemo, useState } from "react";
import { Mic, Paperclip, Smile } from "lucide-react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useChatWebSocket } from "@/lib/hooks/socket";
import IconActionButton from "./icon-action-button";
import SubmitButton from "./submit-button";

type ChatComposerProps = {
  className?: string;
};

const ChatComposer = ({ className }: ChatComposerProps) => {
  const [text, setText] = useState("");
  const params = useParams<{ chatId?: string | string[] }>();
  const {
    sendMessage: sendSocketMessage,
    stopGeneration,
    isAssistantBusy,
    errorMessage,
  } = useChatWebSocket();

  const activeChatId = useMemo(() => {
    const value = params?.chatId;

    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value ?? null;
  }, [params]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isAssistantBusy) {
      return;
    }

    const message = text.trim();

    if (!message) {
      return;
    }

    const didSend = sendSocketMessage({ message, chatId: activeChatId });

    if (!didSend) {
      return;
    }

    setText("");
  };

  return (
    <div className={cn("mx-auto w-full max-w-[1400px] min-w-0", className)}>
      <form
        dir="ltr"
        onSubmit={handleSubmit}
        className={cn(
          "flex w-full items-center gap-2 rounded-[20px] border px-2.5 py-2.5 sm:gap-3 sm:rounded-[22px] sm:px-4 sm:py-4",
          "border-[#d3dee8] bg-[#dce8f2]/95",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_24px_rgba(15,23,42,0.08)]",
          "dark:border-[#747ab0]/55 dark:bg-[#16154d]/82 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_28px_rgba(0,0,0,0.35)]",
        )}
      >
        <SubmitButton
          disabled={!text.trim() || isAssistantBusy}
          isBusy={isAssistantBusy}
          onStop={stopGeneration}
        />

        <div
          className={cn(
            "flex min-h-[46px] min-w-0 flex-1 items-center gap-1 rounded-2xl px-2.5 sm:min-h-[54px] sm:gap-2 sm:px-4",
            "bg-[#f5f7f9] text-[#64748b]",
            "dark:bg-[#8f8aad] dark:text-white/75",
            isAssistantBusy ? "opacity-80" : "",
          )}
        >
          <div className="flex shrink-0 items-center gap-px sm:gap-0.5">
            <IconActionButton aria-label="Insert emoji">
              <Smile className="size-4 sm:size-5" />
            </IconActionButton>

            <IconActionButton aria-label="Attach file">
              <Paperclip className="size-4 sm:size-5" />
            </IconActionButton>
          </div>

          <input
            dir="rtl"
            value={text}
            disabled={isAssistantBusy}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (isAssistantBusy && event.key === "Enter") {
                event.preventDefault();
              }
            }}
            placeholder={isAssistantBusy ? "لطفا تا پایان پاسخ صبر کنید..." : "اینجا تایپ کنید..."}
            className={cn(
              "h-10 min-w-0 flex-1 bg-transparent text-right text-[0.97rem] leading-none outline-none sm:h-11 sm:text-base md:text-[32px]",
              "placeholder:text-[#7f8a97] dark:placeholder:text-white/82",
              "disabled:cursor-not-allowed disabled:opacity-70",
            )}
          />

          <button
            type="button"
            aria-label="Voice input"
            disabled={isAssistantBusy}
            className="grid size-7 shrink-0 place-items-center rounded-full text-[#0f80cf] transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-45 dark:text-white/95 dark:hover:bg-white/10 sm:size-8"
          >
            <Mic className="size-4 sm:size-5" />
          </button>
        </div>
      </form>

      {errorMessage ? (
        <p className="mt-2 text-right text-sm font-medium text-rose-600 dark:text-rose-300">{errorMessage}</p>
      ) : null}
    </div>
  );
};

export default ChatComposer;
