import { cn } from "@/lib/utils";
import MessageActions from "@/components/templates/chats/chat-thread/message-actions";
import MessageContent from "@/components/templates/chats/chat-thread/message-content";
import type { ChatMessageStatus } from "@/lib/stores/chat-store";

type AssistantMessageCardProps = {
  content: string;
  status?: ChatMessageStatus;
  grouped?: boolean;
};

const AssistantMessageCard = ({ content, status = "done", grouped = false }: AssistantMessageCardProps) => {
  const isThinking = status === "thinking";
  const isTyping = status === "typing";
  const isError = status === "error";
  const showActions = status === "done" || status === "cancelled" || status === "error";
  const errorLabel = content.trim() || "خطا در پردازش";

  return (
    <article className={cn("flex w-full flex-col items-end", grouped ? "mt-2" : "mt-5")}>
      <div className="flex w-fit max-w-[87vw] flex-col items-start sm:max-w-[78vw] md:max-w-[68vw] lg:max-w-xl">
        <div className="min-w-16 rounded-[1.55rem] rounded-tl-[0.9rem] border border-[#d4ddf4]/78 bg-linear-to-b from-white/78 to-[#e9efff]/56 px-4 py-3.5 text-[#1f2f57] shadow-[0_10px_24px_rgba(93,113,163,0.15)] backdrop-blur-[12px] sm:px-5 sm:py-4 dark:border-[#8fa8ff38] dark:bg-linear-to-b dark:from-white/10 dark:to-white/6 dark:text-white/92 dark:shadow-[0_12px_28px_rgba(0,0,0,0.26)]">
          {isThinking ? (
            <div
              dir="rtl"
              className="flex items-center gap-2.5 text-[0.95rem] font-medium sm:text-[1rem]"
            >
              <span className="animate-pulse">در حال فکر کردن...</span>
              <span className="flex items-center gap-1" aria-hidden>
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:0ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:140ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:280ms]" />
              </span>
            </div>
          ) : isError ? (
            <div className="inline-flex max-w-full items-center rounded-lg border border-rose-400/75 bg-rose-50 px-3 py-1.5 text-[0.86rem] font-medium text-rose-700 dark:border-rose-300/55 dark:bg-rose-500/10 dark:text-rose-200">
              <span className="truncate">{errorLabel}</span>
            </div>
          ) : (
            <MessageContent
              content={content}
              showTypingCursor={isTyping}
              className="text-[0.95rem] font-medium sm:text-[1rem]"
            />
          )}
        </div>

        {showActions ? (
          <MessageActions side="left" text={content} showFeedback className="w-full" />
        ) : null}
      </div>
    </article>
  );
};

export default AssistantMessageCard;
