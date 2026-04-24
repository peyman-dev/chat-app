"use client";

import { motion } from "motion/react";
import AuthHeader from "@/components/templates/auth/auth-header";
import AuthSubmitButton from "@/components/templates/auth/auth-submit-button";
import OtpInput from "@/components/templates/auth/otp-input";

type AuthOtpStepProps = {
  isLogin: boolean;
  mobile: string;
  otp: string;
  otpError: string;
  otpLength: number;
  isPending: boolean;
  secondsLeft: number;
  formattedTimer: string;
  onOtpChange: (value: string) => void;
  onResend: () => void;
  onVerifyOtp: () => void;
  submitLabel?: string;
};

const AuthOtpStep = ({
  isLogin,
  mobile,
  otp,
  otpError,
  otpLength,
  isPending,
  secondsLeft,
  formattedTimer,
  onOtpChange,
  onResend,
  onVerifyOtp,
  submitLabel = "تایید",
}: AuthOtpStepProps) => {
  return (
    <motion.div
      key="otp-step"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <AuthHeader mode="otp" title={isLogin ? "ورود" : "ثبت نام"} mobile={mobile} />

      <div className="mt-16 space-y-7 text-center sm:mt-[4.9rem]">
        <p className="text-lg font-extrabold text-[#241a81] dark:text-white">
          کد {otpLength} رقمی ارسال شده به موبایل خود را وارد کنید
        </p>

        <OtpInput value={otp} onChange={onOtpChange} disabled={isPending} length={otpLength} error={otpError} />

        <p className="text-sm font-bold text-[#6c6fa0] dark:text-white/60">
          {secondsLeft > 0 ? (
            <>
              ارسال دوباره کد <span dir="ltr">{formattedTimer}</span>
            </>
          ) : (
            <button
              type="button"
              className="text-[#16c7bf] outline-none transition hover:opacity-90 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#16c7bf]/50"
              onClick={onResend}
            >
              ارسال مجدد کد
            </button>
          )}
        </p>
      </div>

      <div className="mt-18 sm:mt-20">
        <AuthSubmitButton onClick={onVerifyOtp} loading={isPending}>
          {submitLabel}
        </AuthSubmitButton>
      </div>
    </motion.div>
  );
};

export default AuthOtpStep;
