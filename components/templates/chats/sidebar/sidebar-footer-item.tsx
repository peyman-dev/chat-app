import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type SidebarFooterItemProps = {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
};

const SidebarFooterItem = ({ icon, label, onClick, isActive = false }: SidebarFooterItemProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className={cn(
        "flex w-full items-center  gap-2 rounded-xl px-3 py-1.5 text-right text-[38px] font-semibold outline-none transition-colors",
        "text-[#254ebd] hover:bg-[#edf2fb] focus-visible:ring-2 focus-visible:ring-[#2c82d8]/60",
        "dark:text-[#a5caff] dark:hover:bg-white/8",
        isActive && "bg-[#edf3fc] dark:bg-white/12",
      )}
    >
      <span className="grid size-7 place-items-center text-[#8fa2de] dark:text-[#8bb8f4]">{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
};

export default SidebarFooterItem;
