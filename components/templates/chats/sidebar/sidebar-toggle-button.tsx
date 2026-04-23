import { Menu, PanelRightClose, PanelRightOpen, X } from "lucide-react";
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
    Icon: PanelRightOpen,
  },
  collapse: {
    label: "جمع کردن سایدبار",
    Icon: PanelRightClose,
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
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      aria-label={label}
      className={cn(
        "grid size-10 place-items-center rounded-xl border border-[#c7d2e7] bg-[#e1e8f6]/92 text-[#1876c7] outline-none backdrop-blur-lg",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_8px_18px_rgba(81,102,152,0.2)]",
        "transition-colors hover:bg-[#e8effb] focus-visible:ring-2 focus-visible:ring-[#7ebcff]/70",
        "dark:border-white/14 dark:bg-white/9 dark:text-[#d8e9ff] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_8px_20px_rgba(4,12,42,0.35)] dark:hover:bg-white/14",
        className,
      )}
    >
      <Icon className="size-[1.05rem]" strokeWidth={2.15} />
    </motion.button>
  );
};

export default SidebarToggleButton;
