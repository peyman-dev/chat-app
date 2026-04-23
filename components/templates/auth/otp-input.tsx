"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string;
};

const sanitizeDigits = (value: string) => value.replace(/\D+/g, "");

const OtpInput = ({ value, onChange, length = 5, disabled, error }: OtpInputProps) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = useMemo(() => {
    const chars = value.split("").slice(0, length);
    return Array.from({ length }, (_, index) => chars[index] ?? "");
  }, [length, value]);

  useEffect(() => {
    if (value.length < length) {
      refs.current[value.length]?.focus();
    }
  }, [length, value]);

  const updateAt = (index: number, nextChar: string) => {
    const nextDigits = [...digits];
    nextDigits[index] = nextChar;
    onChange(nextDigits.join("").slice(0, length));
  };

  const handleChange = (index: number, rawValue: string) => {
    if (disabled) {
      return;
    }

    const next = sanitizeDigits(rawValue);

    if (!next) {
      updateAt(index, "");
      return;
    }

    if (next.length > 1) {
      const merged = `${digits.join("")}${next}`.slice(0, length);
      onChange(merged);
      refs.current[Math.min(merged.length, length - 1)]?.focus();
      return;
    }

    updateAt(index, next[0]);

    if (index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pasted = sanitizeDigits(event.clipboardData.getData("text")).slice(0, length);

    if (!pasted) {
      return;
    }

    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div>
      <div className="mx-auto flex w-fit items-center justify-center gap-2.5 sm:gap-3" dir="ltr">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            value={digit}
            disabled={disabled}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`رقم ${index + 1} کد تایید`}
            className={cn(
              "otp-slot size-13 rounded-2xl border border-black/5 text-center text-xl font-black text-[#21187e] outline-none transition focus-visible:border-[#2f2f87]/35 focus-visible:ring-2 focus-visible:ring-[#2f2f87]/35 dark:border-white/20 dark:text-white dark:focus-visible:ring-[#12d7ce]/45 bg-linear-to-t dark:from-white/10! from-black/2 to-black/8 ",
              error && "border-rose-400/80 dark:border-rose-400/80",
            )}
          />
        ))}
      </div>

      {error ? <p className="mt-2 text-center text-xs font-bold text-rose-700 dark:text-rose-300">{error}</p> : null}
    </div>
  );
};

export default OtpInput;
