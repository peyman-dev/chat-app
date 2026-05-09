import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type SidebarFooterItemProps = {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  collapsed?: boolean;
};

const SidebarFooterItem = ({
  icon,
  label,
  onClick,
  isActive = false,
  collapsed = false,
}: SidebarFooterItemProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ x: collapsed ? 0 : -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      title={collapsed ? label : undefined}
      className={cn(
        "flex w-full items-center rounded-xl border border-transparent text-sm font-semibold outline-none transition-colors",
        "text-[#253FAE] font-bold! dark:text-[#e8f1ff]! hover:border-white/16 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#81beff]/70",
        isActive && "border-white/24 bg-white/13",
        collapsed ? "justify-center px-0 py-2.5" : " gap-2 px-2.5 py-2.5",
      )}
    >
      <span className="grid size-5 place-items-center text-[#253FAE] dark:text-[#b7d5ff]">{icon}</span>
      {!collapsed ? <span>{label}</span> : null}
    </motion.button>
  );
};

export default SidebarFooterItem;
