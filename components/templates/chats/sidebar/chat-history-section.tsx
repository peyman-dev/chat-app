import { AnimatePresence, motion } from "motion/react";
import ChatHistoryItem from "./chat-history-item";

export type SidebarChatItem = {
  id: string;
  title: string;
};

type ChatHistorySectionProps = {
  items: SidebarChatItem[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
};

const ChatHistorySection = ({ items, activeChatId, onSelect }: ChatHistorySectionProps) => {
  return (
    <section className="mt-6 flex min-h-0 flex-1 flex-col">
      <h2 className="text-right text-xl mb-5 leading-[1.05] font-black text-[#1871AC] dark:text-[#f4f7ff]  drop-shadow-[0_2px_10px_rgba(18,34,84,0.25)]">
        تاریخچه چت ها
      </h2>

      <AnimatePresence mode="wait" initial={false}>
        {items?.length === 0 ? (
          <motion.p
            key="history-empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mt-7 text-right text-sm font-medium text-[#6282ee]! dark:text-[#d3ddff]"
          >
            هنوز چتی ندارید
          </motion.p>
        ) : (
          <motion.div
            key="history-list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-4 flex-1 space-y-1.5 overflow-y-auto pl-1"
          >
            {items?.map((item) => (
              <ChatHistoryItem
                key={item.id}
                label={item.title}
                isActive={item.id === activeChatId}
                onClick={() => onSelect(item.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ChatHistorySection;
