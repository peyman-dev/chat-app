import { AnimatePresence, motion } from "motion/react";
import { MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

type NewChatButtonProps = {
  onClick: () => void;
  collapsed?: boolean;
};

const NewChatButton = ({ onClick, collapsed = false }: NewChatButtonProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group mt-3 flex h-12 items-center justify-center overflow-hidden rounded-2xl border border-white/18 bg-white/18 px-4 text-sm font-semibold text-[#0f5fb1] outline-none backdrop-blur-md",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_24px_rgba(63,86,145,0.24)]",
        "transition-colors hover:bg-white/26 focus-visible:ring-2 focus-visible:ring-[#81beff]/70",
        "dark:border-white/14 dark:bg-white/9 dark:text-[#d5e9ff] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_28px_rgba(4,8,34,0.5)] dark:hover:bg-white/14",
        collapsed ? "w-12 px-0" : "w-full gap-2.5",
      )}
      title={collapsed ? "صفحه چت جدید" : undefined}
    >
      <MessageSquarePlus className="size-[1.08rem] shrink-0" strokeWidth={2.2} />
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.span
            key="new-chat-label"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            صفحه چت جدید
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
};

export default NewChatButton;
