"use client";

import Link from "next/link";
import { motion } from "motion/react";
import AuthHeader from "@/components/templates/auth/auth-header";
import MobileInput from "@/components/templates/auth/mobile-input";

type AuthMobileStepProps = {
  mode: "login" | "register";
  mobile: string;
  mobileError: string;
  isPending: boolean;
  onMobileChange: (value: string) => void;
  onRequestOtp: () => void;
};

const AuthMobileStep = ({
  mode,
  mobile,
  mobileError,
  isPending,
  onMobileChange,
  onRequestOtp,
}: AuthMobileStepProps) => {
  const isLogin = mode === "login";

  return (
    <motion.div
      key="mobile-step"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <AuthHeader
        mode="mobile"
        title={isLogin ? "ورود" : "ثبت نام"}
        subtitle="به چت بات هوشمند صندوق نوآوری و شکوفایی خوش آمدید"
      />

      <div className="mt-10 space-y-7 sm:mt-12 sm:space-y-8">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onRequestOtp();
          }}
          className="space-y-4"
        >
          <MobileInput
            value={mobile}
            onChange={onMobileChange}
            onSubmit={onRequestOtp}
            disabled={isPending}
            error={mobileError}
          />
        </form>

        <p className="auth-signup-text pt-1 text-center">
          {isLogin ? "حساب کاربری ندارید؟" : "قبلا ثبت نام کرده اید؟"}{" "}
          <Link
            href={isLogin ? "/auth/register" : "/auth/login"}
            className="auth-signup-link outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#12d7ce]/55"
          >
            {isLogin ? "ثبت نام" : "ورود"}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default AuthMobileStep;
