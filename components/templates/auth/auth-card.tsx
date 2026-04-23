import { cn } from "@/lib/utils";

type AuthCardProps = {
  children: React.ReactNode;
  className?: string;
};

const AuthCard = ({ children, className }: AuthCardProps) => {
  return (
    <section
      className={cn(
        "auth-card relative z-10 mx-auto w-full max-w-[31.25rem] overflow-hidden rounded-[2rem] px-5 pb-8 pt-7 shadow-[0_18px_42px_rgba(69,88,144,0.23)] sm:rounded-[2.15rem] sm:px-8 sm:pb-10 sm:pt-8 dark:shadow-[0_22px_58px_rgba(0,0,0,0.32)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90 [background:radial-gradient(circle_at_10%_8%,rgba(31,204,200,0.22),transparent_28%),radial-gradient(circle_at_87%_10%,rgba(255,255,255,0.25),transparent_24%),radial-gradient(circle_at_81%_90%,rgba(43,199,233,0.24),transparent_28%)] dark:[background:radial-gradient(circle_at_12%_10%,rgba(19,185,178,0.35),transparent_24%),radial-gradient(circle_at_86%_8%,rgba(255,255,255,0.13),transparent_23%),radial-gradient(circle_at_84%_88%,rgba(35,188,252,0.31),transparent_32%)]"
      />
      <div className="relative">{children}</div>
    </section>
  );
};

export default AuthCard;
