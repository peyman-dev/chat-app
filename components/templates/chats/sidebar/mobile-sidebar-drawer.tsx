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
            className="fixed inset-0 z-40 bg-[#020619]/56 backdrop-blur-[2px] lg:hidden"
          />

          <motion.aside
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-[min(350px,86vw)] overflow-hidden shadow-[-18px_0_34px_rgba(2,5,25,0.5)] lg:hidden"
          >
            {children}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default MobileSidebarDrawer;
