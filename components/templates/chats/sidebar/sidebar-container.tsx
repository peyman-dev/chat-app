import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SidebarContainerProps = {
  children: ReactNode;
  className?: string;
};

const SidebarContainer = ({ children, className }: SidebarContainerProps) => {
  return (
    <div
      dir="rtl"
      className={cn(
        "flex h-dvh w-full flex-col border-l px-7 pb-9 pt-4",
        "border-[#d2d9ea] bg-[#d7dced]",
        "dark:border-[#2a3868] dark:bg-[#101845]",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default SidebarContainer;
