import { MailCheck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
  mode: "mobile" | "otp";
  mobile?: string;
};

const maskMobile = (mobile?: string) => {
  if (!mobile) {
    return "";
  }

  const normalized = mobile.replace(/\D+/g, "");

  if (normalized.length < 7) {
    return mobile;
  }

  return `${normalized.slice(0, 4)}***${normalized.slice(-3)}`;
};

const AuthHeader = ({ title, subtitle, mode, mobile }: AuthHeaderProps) => {
  return (
    <header className="text-center">
      <div className="mx-auto grid size-[3.75rem] place-items-center rounded-full border border-white/40 bg-white/22 text-[#251a80] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-sm dark:border-white/30 dark:bg-white/12 dark:text-white">
        {mode === "mobile" ? <UserRound className="size-6" /> : <MailCheck className="size-6" />}
      </div>

      <h1 className={cn("mt-4 text-5xl font-black leading-none tracking-tight text-[#20127b] dark:text-white", mode === "otp" && "sr-only")}>
        {title}
      </h1>

      {mode === "mobile" ? (
        <p className="mt-6 text-[0.94rem] font-medium leading-7 text-[#4b4e6a] dark:text-white/82">{subtitle}</p>
      ) : (
        <p className="mt-4 text-sm font-semibold tracking-wide text-[#3a438d] dark:text-white/75" dir="ltr">
          {maskMobile(mobile)}
        </p>
      )}
    </header>
  );
};

export default AuthHeader;
