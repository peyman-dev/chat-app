import { Menu } from "lucide-react";
import { motion } from "motion/react";

type SidebarHeaderProps = {
  onMenuClick?: () => void;
};

const SidebarHeader = ({ onMenuClick }: SidebarHeaderProps) => {
  return (
    <header className="flex h-[64px] items-start justify-end">
      <motion.button
        type="button"
        onClick={onMenuClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        aria-label="باز و بسته کردن منو"
        className="grid size-11 place-items-center rounded-lg text-[#2280d2] outline-none transition-colors hover:bg-white/35 focus-visible:ring-2 focus-visible:ring-[#2c82d8]/60 dark:text-[#89beff] dark:hover:bg-white/8"
      >
        <Menu className="size-7" strokeWidth={2.1} />
      </motion.button>
    </header>
  );
};

export default SidebarHeader;
