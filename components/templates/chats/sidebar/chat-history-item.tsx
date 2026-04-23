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
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "w-full rounded-xl px-4 py-2 text-right text-[37px] leading-tight font-medium outline-none transition-colors",
        "text-[#69a8e6] hover:bg-[#edf2fb] hover:text-[#3d93d7] focus-visible:ring-2 focus-visible:ring-[#2c82d8]/60",
        "dark:text-[#8dbfff] dark:hover:bg-white/8 dark:hover:text-[#cfe4ff]",
        isActive && "bg-[#edf3fc] text-[#1b7fcd] dark:bg-white/12 dark:text-[#d9e9ff]",
      )}
      title={label}
    >
      <span className="block truncate">{label}</span>
    </motion.button>
  );
};

export default ChatHistoryItem;
