import { Menu } from "lucide-react";
import { motion } from "motion/react";

type MobileSidebarToggleProps = {
  onClick: () => void;
};

const MobileSidebarToggle = ({ onClick }: MobileSidebarToggleProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      aria-label="باز کردن سایدبار"
      className="fixed right-4 top-4 z-40 grid size-11 place-items-center rounded-xl border border-[#d3daea] bg-[#e2e6f4]/95 text-[#2280d2] shadow-[0_8px_22px_rgba(40,66,122,0.2)] outline-none hover:bg-[#ecf0fa] focus-visible:ring-2 focus-visible:ring-[#2c82d8]/60 lg:hidden dark:border-[#29376a] dark:bg-[#111b55]/95 dark:text-[#89beff] dark:hover:bg-[#18286b]"
    >
      <Menu className="size-6" strokeWidth={2.1} />
    </motion.button>
  );
};

export default MobileSidebarToggle;
