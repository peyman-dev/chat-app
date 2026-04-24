import { ArrowUp } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const SubmitButton = ({ className, disabled, ...props }: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full bg-[#83898f] text-[#dce4eb] transition-all sm:size-[56px]",
        "border border-transparent",
        "dark:bg-[#b8bdd6] dark:text-[#1f2b7d] dark:border-[#0ea5ff]",
        "disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      {...props}
    >
      <ArrowUp className="size-6 sm:size-8" strokeWidth={2.4} />
    </button>
  );
};

export default SubmitButton;
