type AuthNameInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  autoComplete?: string;
};

const AuthNameInput = ({ label, value, onChange, disabled, error, autoComplete }: AuthNameInputProps) => {
  return (
    <div>
      <div className="auth-input flex min-h-[3.55rem] items-center gap-3 rounded-[1.05rem] border border-[#282388]/65 bg-white/72 px-3 dark:border-white/33 dark:bg-white/14">
        <div className="auth-email-field relative flex min-w-0 flex-1 flex-col gap-1 text-right">
          <span className="auth-input-label top-0.5 absolute font-normal!">{label}</span>

          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            type="text"
            autoComplete={autoComplete}
            disabled={disabled}
            className="auth-email-input w-full border-none bg-transparent pt-2 text-right text-[0.96rem] text-[#6d728a] outline-none placeholder:text-[#8f93a8] disabled:cursor-not-allowed disabled:opacity-70 dark:text-white/80 dark:placeholder:text-white/55"
          />
        </div>
      </div>

      {error ? <p className="mt-2 px-1 text-right text-xs font-bold text-rose-700 dark:text-rose-300">{error}</p> : null}
    </div>
  );
};

export default AuthNameInput;

