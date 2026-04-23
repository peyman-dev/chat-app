import { AnimatePresence, motion } from "motion/react";
import { ReactNode } from "react";

type MobileSidebarDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

const MobileSidebarDrawer = ({ isOpen, onClose, children }: MobileSidebarDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="بستن سایدبار"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-[#0c163b]/40 backdrop-blur-[1px] lg:hidden"
          />

          <motion.aside
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-[min(392px,88vw)] lg:hidden"
          >
            {children}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default MobileSidebarDrawer;
