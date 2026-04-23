import { cn } from "@/lib/utils";

type AuthSubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
};

const AuthSubmitButton = ({
  children,
  className,
  disabled,
  loading,
  type = "submit",
  onClick,
}: AuthSubmitButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#12cfc6] px-5 text-base font-extrabold text-white shadow-[0_12px_24px_rgba(18,207,198,0.3)] outline-none transition focus-visible:ring-2 focus-visible:ring-[#16d7ce]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#12d7ce] dark:text-[#17194f]",
        className,
      )}
    >
      {loading ? "در حال پردازش..." : children}
    </button>
  );
};

export default AuthSubmitButton;
