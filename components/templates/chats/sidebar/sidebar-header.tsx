import { AnimatePresence, motion } from "motion/react";
import SidebarToggleButton from "./sidebar-toggle-button";

type SidebarHeaderProps = {
  collapsed?: boolean;
  isMobile?: boolean;
  onToggle: () => void;
};

const SidebarHeader = ({ collapsed = false, isMobile = false, onToggle }: SidebarHeaderProps) => {
  return (
    <header
      className={[
        "flex min-h-12 w-full items-center",
        collapsed && !isMobile ? "justify-center" : "justify-start",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={`${collapsed ? "collapsed" : "expanded"}-${isMobile ? "mobile" : "desktop"}`}
          initial={{ opacity: 0, scale: 0.94, y: -2, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.94, y: -2, filter: "blur(4px)" }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={collapsed && !isMobile ? "grid size-12 place-items-center" : "grid size-10 place-items-center"}
        >
          <SidebarToggleButton
            mode={isMobile ? "close-mobile" : collapsed ? "expand" : "collapse"}
            onClick={onToggle}
          />
        </motion.div>
      </AnimatePresence>
    </header>
  );
};

export default SidebarHeader;
