import { ArrowLeft } from "lucide-react";

type MobileInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  error?: string;
  showSubmitButton?: boolean;
};

const MobileInput = ({ value, onChange, onSubmit, disabled, error, showSubmitButton = true }: MobileInputProps) => {
  return (
    <div>
      <div className="auth-input flex min-h-[3.55rem] items-center gap-3 rounded-[1.05rem] border border-[#282388]/65 bg-white/72 px-3 dark:border-white/33 dark:bg-white/14">


        <div className="auth-email-field relative flex min-w-0 flex-1 flex-col gap-1 text-right">
          <span className="auth-input-label top-0.5 font-normal! absolute">شماره موبایل</span>

          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            dir="ltr"
            placeholder="0912xxxxxxx"
            className="auth-email-input w-full border-none pt-2 bg-transparent text-right text-[0.96rem] text-[#6d728a] outline-none placeholder:text-[#8f93a8] dark:text-white/80 dark:placeholder:text-white/55"
          />
        </div>
        {showSubmitButton ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            aria-label="دریافت کد تایید"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[#24157d] text-white outline-none transition hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[#24157d]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#12d7ce] dark:text-[#181b55]"
          >
            <ArrowLeft className="size-4" />
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-2 px-1 text-right text-xs font-bold text-rose-700 dark:text-rose-300">{error}</p> : null}
    </div>
  );
};

export default MobileInput;
