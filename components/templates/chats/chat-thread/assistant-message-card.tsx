import { cn } from "@/lib/utils";
import MessageActions from "@/components/templates/chats/chat-thread/message-actions";
import MessageContent from "@/components/templates/chats/chat-thread/message-content";

type AssistantMessageCardProps = {
  text: string;
  grouped?: boolean;
};

const AssistantMessageCard = ({ text, grouped = false }: AssistantMessageCardProps) => {
  return (
    <article className={cn("flex w-full flex-col items-end", grouped ? "mt-2" : "mt-5")}>
      <div className="flex w-fit max-w-[87vw] flex-col items-start sm:max-w-[78vw] md:max-w-[68vw] lg:max-w-xl">
        <div className="min-w-16 rounded-[1.55rem] rounded-tl-[0.9rem] border border-[#d4ddf4]/78 bg-linear-to-b from-white/78 to-[#e9efff]/56 px-4 py-3.5 text-[#1f2f57] shadow-[0_10px_24px_rgba(93,113,163,0.15)] backdrop-blur-[12px] sm:px-5 sm:py-4 dark:border-[#8fa8ff38] dark:bg-linear-to-b dark:from-white/10 dark:to-white/6 dark:text-white/92 dark:shadow-[0_12px_28px_rgba(0,0,0,0.26)]">
          <MessageContent text={text} className="text-[0.95rem] font-medium sm:text-[1rem]" />
        </div>

        <MessageActions side="left" text={text} showFeedback className="w-full" />
      </div>
    </article>
  );
};

export default AssistantMessageCard;
