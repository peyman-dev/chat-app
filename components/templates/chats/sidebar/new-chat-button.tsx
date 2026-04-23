import { MessageSquarePlus } from "lucide-react";
import { motion } from "motion/react";

type NewChatButtonProps = {
  onClick: () => void;
};

const NewChatButton = ({ onClick }: NewChatButtonProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ y: 0, scale: 0.985 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="mt-2 flex h-[56px] w-full items-center justify-center gap-2.5 rounded-[18px] bg-[#f5f5f6] px-5 text-[31px] font-semibold text-[#1779cc] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-[#fafafa] focus-visible:ring-2 focus-visible:ring-[#2c82d8]/60 dark:bg-[#d8ddf226] dark:text-[#98c9ff] dark:hover:bg-[#dde5ff33]"
    >
      <MessageSquarePlus className="size-[20px]" strokeWidth={2.2} />
      <span>صفحه چت جدید</span>
    </motion.button>
  );
};

export default NewChatButton;
