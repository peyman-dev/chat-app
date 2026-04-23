import { cn } from "@/lib/utils";
import MessageActions from "@/components/templates/chats/chat-thread/message-actions";
import MessageContent from "@/components/templates/chats/chat-thread/message-content";

type UserMessageCardProps = {
  text: string;
  grouped?: boolean;
};

const UserMessageCard = ({ text, grouped = false }: UserMessageCardProps) => {
  return (
    <article className={cn("flex w-full flex-col ", grouped ? "mt-2" : "mt-5")}>
      <div className="flex w-fit max-w-[85vw] flex-col items-end sm:max-w-[76vw] md:max-w-[66vw] lg:max-w-xl">
        <div className="min-w-16 rounded-[1.6rem] rounded-tr-[0.9rem] border border-[#6a72d4]/45 bg-linear-to-b from-[#655fc8]/58 via-[#554dc1]/54 to-[#473fae]/52 px-4 py-3.5 text-white shadow-[0_12px_28px_rgba(59,71,147,0.24)] backdrop-blur-[12px] sm:px-5 sm:py-4 dark:border-[#7289fa66] dark:from-[#322b78]/93 dark:via-[#282267]/92 dark:to-[#201b56]/92 dark:shadow-[0_14px_28px_rgba(0,0,0,0.42)]">
          <MessageContent text={text} className="text-[0.95rem] font-medium text-white/96 sm:text-[1rem]" />
        </div>

        <MessageActions side="right" text={text} className="w-full" />
      </div>
    </article>
  );
};

export default UserMessageCard;
