import { motion } from "motion/react";
import ChatHistoryItem from "./chat-history-item";

export type SidebarChatItem = {
  chatId: string;
  title: string;
};

type ChatHistorySectionProps = {
  items: SidebarChatItem[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
};

const ChatHistorySection = ({ items, activeChatId, onSelect }: ChatHistorySectionProps) => {
  const isEmpty = items.length === 0;

  return (
    <section className="mt-7 flex min-h-0 flex-1 flex-col">
      <h2
        className={[
          "text-right font-extrabold text-[#0f7ece] dark:text-[#8ec6ff]",
          isEmpty ? "text-[26px] leading-[0.92]" : "text-[26px] leading-none",
        ].join(" ")}
      >
        تاریخچه
        چت ها
      </h2>

      {isEmpty ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="mt-8 text-right text-base font-semibold text-[#8bb8e6] dark:text-[#80aee1]"
        >
          هنوز چتی ندارید
        </motion.p>
      ) : (
        <div className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1">
          {items.map((item) => (
            <ChatHistoryItem
              key={item.chatId}
              label={item.title}
              isActive={item.chatId === activeChatId}
              onClick={() => onSelect(item.chatId)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ChatHistorySection;
