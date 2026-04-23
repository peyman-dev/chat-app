import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type IconActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const IconActionButton = ({ className, ...props }: IconActionButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        "grid size-7 place-items-center rounded-full text-[#0f80cf] transition-colors hover:bg-black/5 dark:text-white/90 dark:hover:bg-white/10",
        className,
      )}
      {...props}
    />
  );
};

export default IconActionButton;
