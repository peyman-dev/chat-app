import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type ChatHistoryItemProps = {
  label: string;
  isActive?: boolean;
  onClick: () => void;
};

const ChatHistoryItem = ({ label, isActive = false, onClick }: ChatHistoryItemProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "w-full rounded-xl border border-transparent px-3.5 py-2 text-right text-base font-medium outline-none",
        "text-[#4a5f99] transition-colors hover:border-white/20 hover:bg-white/22 hover:text-[#224f95] focus-visible:ring-2 focus-visible:ring-[#81beff]/70",
        "dark:text-[#b9c8f2]! dark:hover:border-white/12 dark:hover:bg-white/9 dark:hover:text-[#e7f0ff]",
        isActive &&
          "border-[#8cb4eb55] bg-white/35 text-[#1c4f9a] dark:border-[#a8c4ff52] dark:bg-white/14 dark:text-[#f2f7ff]",
      )}
      title={label}
    >
      <span className="block truncate">{label}</span>
    </motion.button>
  );
};

export default ChatHistoryItem;
