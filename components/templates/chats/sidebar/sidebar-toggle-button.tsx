import { Menu, PanelRightClose, X } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type SidebarToggleButtonMode = "expand" | "collapse" | "open-mobile" | "close-mobile";

type SidebarToggleButtonProps = {
  mode: SidebarToggleButtonMode;
  onClick: () => void;
  className?: string;
};

const config: Record<
  SidebarToggleButtonMode,
  { label: string; Icon: typeof PanelRightClose }
> = {
  expand: {
    label: "باز کردن سایدبار",
    Icon: Menu,
  },
  collapse: {
    label: "جمع کردن سایدبار",
    Icon: Menu,
  },
  "open-mobile": {
    label: "باز کردن سایدبار",
    Icon: Menu,
  },
  "close-mobile": {
    label: "بستن سایدبار",
    Icon: X,
  },
};

const SidebarToggleButton = ({ mode, onClick, className }: SidebarToggleButtonProps) => {
  const { Icon, label } = config[mode];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -0.5 }}
      whileTap={{ scale: 0.96, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      aria-label={label}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl p-0 text-[#1876c7] outline-none",
        // "shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_8px_18px_rgba(81,102,152,0.2)]",
        "transition-[background-color,color,box-shadow,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#7ebcff]/70",
        " dark:text-[#d8e9ff] dark:hover:bg-white/14",
        className,
      )}
    >
      <Icon className="size-[1.05rem] shrink-0" strokeWidth={2.15} />
    </motion.button>
  );
};

export default SidebarToggleButton;
