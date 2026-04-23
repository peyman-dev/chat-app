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
        "relative flex h-dvh w-full flex-col overflow-hidden border-l px-4 pb-6 pt-4 sm:px-5",
        "border-[#c7d0e2] bg-[#d7dce8]",
        "dark:border-[#27376a] dark:bg-[#0b1140]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/35 via-white/14 to-[#d2d9e9]/72 dark:from-white/4 dark:via-[#101b5a]/32 dark:to-[#060d2f]/94" />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_84%_9%,rgba(219,236,255,0.58),transparent_28%),radial-gradient(circle_at_16%_14%,rgba(159,170,218,0.28),transparent_36%),radial-gradient(circle_at_38%_82%,rgba(185,201,236,0.22),transparent_44%)] dark:[background:radial-gradient(circle_at_84%_9%,rgba(166,229,255,0.34),transparent_26%),radial-gradient(circle_at_20%_14%,rgba(121,122,247,0.44),transparent_34%),radial-gradient(circle_at_36%_72%,rgba(73,107,229,0.28),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(35,196,255,0.2),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(128,144,184,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(24,42,108,0.7),inset_0_0_90px_rgba(28,54,158,0.24)]" />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
};

export default SidebarContainer;
