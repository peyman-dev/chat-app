"use client";
import { ArrowUp, Square } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isBusy?: boolean;
  onStop?: () => void;
};

const SubmitButton = ({ className, disabled, isBusy = false, onStop, ...props }: SubmitButtonProps) => {
  if (isBusy) {
    return (
      <button
        type="button"
        onClick={onStop}
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full bg-rose-500 text-white transition-all hover:bg-rose-600 sm:size-[56px]",
          "border border-transparent dark:bg-rose-600 dark:hover:bg-rose-700",
          className,
        )}
        {...props}
      >
        <Square className="size-5 fill-current sm:size-6" strokeWidth={2.2} />
      </button>
    );
  }

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
