import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

type SocialLoginButtonProps = {
  className?: string;
};

const GoogleGlyph = () => {
  return (
    <span className="relative block size-8 rounded-full bg-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <span className="absolute inset-0 grid place-items-center text-[1.08rem] font-black leading-none text-[#4285F4]">
        G
      </span>
    </span>
  );
};

const SocialLoginButton = ({ className }: SocialLoginButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        "auth-social-button auth-input flex h-[3.55rem] w-full items-center justify-between rounded-[1.05rem] px-4 text-right outline-none focus-visible:ring-2 focus-visible:ring-[#2ecbc4]/55",
        className,
      )}
    >
      <GoogleGlyph />

      <span className="text-sm font-extrabold text-[#111827] dark:text-white">
        ادامه با
        <br />
        گوگل
      </span>

      <span className="grid size-8 place-items-center text-[#534a9e] dark:text-white/85">
        <Megaphone className="size-4" />
      </span>
    </button>
  );
};

export default SocialLoginButton;
