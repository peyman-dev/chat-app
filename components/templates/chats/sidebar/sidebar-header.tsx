import { AnimatePresence, motion } from "motion/react";
import SidebarToggleButton from "./sidebar-toggle-button";

type SidebarHeaderProps = {
  collapsed?: boolean;
  isMobile?: boolean;
  onToggle: () => void;
};

const SidebarHeader = ({ collapsed = false, isMobile = false, onToggle }: SidebarHeaderProps) => {
  return (
    <header className="flex min-h-12 items-center justify-end">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${collapsed ? "collapsed" : "expanded"}-${isMobile ? "mobile" : "desktop"}`}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
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
