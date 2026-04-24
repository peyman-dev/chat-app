"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import AuthHeader from "@/components/templates/auth/auth-header";
import AuthRegisterInputs from "@/components/templates/auth/auth-register-inputs";
import AuthSubmitButton from "@/components/templates/auth/auth-submit-button";

type AuthRegisterStepProps = {
  firstName: string;
  lastName: string;
  mobile: string;
  firstNameError: string;
  lastNameError: string;
  mobileError: string;
  isPending: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  onRequestOtp: () => void;
};

const AuthRegisterStep = ({
  firstName,
  lastName,
  mobile,
  firstNameError,
  lastNameError,
  mobileError,
  isPending,
  onFirstNameChange,
  onLastNameChange,
  onMobileChange,
  onRequestOtp,
}: AuthRegisterStepProps) => {
  return (
    <motion.div
      key="register-step"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <AuthHeader
        mode="mobile"
        title="ثبت نام"
        subtitle="اطلاعات خود را وارد کنید و کد احراز هویت را تایید کنید"
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onRequestOtp();
        }}
        className="mt-10 space-y-6 sm:mt-12"
      >
        <AuthRegisterInputs
          firstName={firstName}
          lastName={lastName}
          mobile={mobile}
          firstNameError={firstNameError}
          lastNameError={lastNameError}
          mobileError={mobileError}
          isPending={isPending}
          onFirstNameChange={onFirstNameChange}
          onLastNameChange={onLastNameChange}
          onMobileChange={onMobileChange}
        />

        <AuthSubmitButton
          type="submit"
          loading={isPending}
          className="bg-[#24157d] shadow-[0_12px_24px_rgba(36,21,125,0.35)] dark:bg-[#12d7ce] dark:text-[#17194f]"
        >
          <span className="inline-flex items-center gap-2">
            دریافت کد احراز هویت
            <ArrowLeft className="size-4" />
          </span>
        </AuthSubmitButton>
      </form>

      <p className="auth-signup-text pt-6 text-center">
        قبلا ثبت نام کرده اید؟{" "}
        <Link
          href="/auth/login"
          className="auth-signup-link outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#12d7ce]/55"
        >
          ورود
        </Link>
      </p>
    </motion.div>
  );
};

export default AuthRegisterStep;
