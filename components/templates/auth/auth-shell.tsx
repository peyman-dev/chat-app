import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: React.ReactNode;
  className?: string;
};

const AuthShell = ({ children, className }: AuthShellProps) => {
  return (
    <main
      className={cn(
        "relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-8 sm:px-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#f7f4ff] dark:bg-[#07062a]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-95 [background:radial-gradient(circle_at_14%_88%,rgba(107,223,255,0.50),transparent_19%),radial-gradient(circle_at_78%_15%,rgba(250,131,175,0.44),transparent_22%),radial-gradient(circle_at_46%_12%,rgba(144,182,255,0.42),transparent_26%),radial-gradient(circle_at_88%_82%,rgba(153,222,255,0.35),transparent_22%),linear-gradient(180deg,#faf7ff_0%,#f4f6ff_46%,#f4f8ff_100%)] dark:[background:radial-gradient(circle_at_12%_13%,rgba(22,201,188,0.45),transparent_21%),radial-gradient(circle_at_84%_16%,rgba(211,214,255,0.22),transparent_20%),radial-gradient(circle_at_84%_84%,rgba(28,194,255,0.35),transparent_25%),radial-gradient(circle_at_22%_88%,rgba(46,172,255,0.32),transparent_24%),linear-gradient(180deg,#0f0a3f_0%,#080735_52%,#060526_100%)]"
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 backdrop-blur-[2px]" />

      {children}
    </main>
  );
};

export default AuthShell;
