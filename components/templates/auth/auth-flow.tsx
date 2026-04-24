"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence } from "motion/react";
import { toast } from "react-toastify";
import { requestOTP, verifyOTP } from "@/app/actions";
import AuthCard from "@/components/templates/auth/auth-card";
import AuthShell from "@/components/templates/auth/auth-shell";
import AuthMobileStep from "@/components/templates/auth/auth-mobile-step";
import AuthOtpStep from "@/components/templates/auth/auth-otp-step";
import AuthRegisterStep from "@/components/templates/auth/auth-register-step";
import AuthFlowToast from "@/components/templates/auth/auth-flow-toast";
import {
  createOtpSchema,
  mobileSchema,
  normalizeOtp,
  normalizePhoneNumberForApi,
  registerProfileSchema,
} from "@/components/templates/auth/auth-flow.validators";

type AuthFlowProps = {
  mode: "login" | "register";
  initialMobile?: string;
};

const OTP_LENGTH = 6;
const RESEND_INITIAL_SECONDS = 56;

const AuthFlow = ({ mode, initialMobile = "" }: AuthFlowProps) => {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState(() => normalizePhoneNumberForApi(initialMobile));
  const [otp, setOtp] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPending, startTransition] = useTransition();

  const isLogin = mode === "login";
  const otpSchema = useMemo(() => createOtpSchema(OTP_LENGTH), []);

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [mode, secondsLeft, step]);

  const formattedTimer = useMemo(() => {
    return `0:${String(secondsLeft).padStart(2, "0")}`;
  }, [secondsLeft]);

  const handleLoginRequestOtp = () => {
    setMobileError("");

    const result = mobileSchema.safeParse({ mobile });

    if (!result.success) {
      setMobileError(result.error.issues[0]?.message ?? "شماره موبایل معتبر نیست");
      return;
    }

    startTransition(async () => {
      try {
        const normalizedMobile = result.data.mobile;
        const response = await requestOTP({ phone_number: normalizedMobile });
        const apiMobile = normalizePhoneNumberForApi(response.data.phone_number || normalizedMobile);

        if (isLogin && response.data.is_new) {
          router.push(`/auth/register?phone_number=${encodeURIComponent(apiMobile)}`);
          return;
        }

        if (!response.success) {
          toast.error(response.message || "ارسال کد با خطا مواجه شد");
          return;
        }

        toast.success(response.message || "کد تایید ارسال شد");
        setMobile(apiMobile);
        setOtp("");
        setOtpError("");
        setStep("otp");
        setSecondsLeft(RESEND_INITIAL_SECONDS);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "ارسال کد با خطا مواجه شد");
      }
    });
  };

  const handleLoginVerifyOtp = () => {
    setOtpError("");

    const validation = otpSchema.safeParse(normalizeOtp(otp));

    if (!validation.success) {
      setOtpError(validation.error.issues[0]?.message ?? "کد تایید معتبر نیست");
      return;
    }

    startTransition(async () => {
      try {
        const response = await verifyOTP({
          phone_number: normalizePhoneNumberForApi(mobile),
          otp: validation.data,
        });

        if (!response.success) {
          toast.error(response.message || "تایید کد با خطا مواجه شد");
          return;
        }

        toast.success(response.message || "ورود موفقیت آمیز بود");
        router.push("/chats");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "تایید کد با خطا مواجه شد");
      }
    });
  };

  const handleRegisterRequestOtp = () => {
    setFirstNameError("");
    setLastNameError("");
    setMobileError("");

    const profileValidation = registerProfileSchema.safeParse({
      first_name: firstName,
      last_name: lastName,
    });

    if (!profileValidation.success) {
      const nameErrors = profileValidation.error.flatten().fieldErrors;
      setFirstNameError(nameErrors.first_name?.[0] ?? "");
      setLastNameError(nameErrors.last_name?.[0] ?? "");
      return;
    }

    const mobileValidation = mobileSchema.safeParse({ mobile });

    if (!mobileValidation.success) {
      setMobileError(mobileValidation.error.issues[0]?.message ?? "شماره موبایل معتبر نیست");
      return;
    }

    startTransition(async () => {
      try {
        const response = await requestOTP({
          phone_number: mobileValidation.data.mobile,
        });

        if (!response.success) {
          toast.error(response.message || "ارسال کد با خطا مواجه شد");
          return;
        }

        toast.success(response.message || "کد تایید ارسال شد");
        setFirstName(profileValidation.data.first_name);
        setLastName(profileValidation.data.last_name);
        setMobile(normalizePhoneNumberForApi(response.data.phone_number || mobileValidation.data.mobile));
        setOtp("");
        setOtpError("");
        setStep("otp");
        setSecondsLeft(RESEND_INITIAL_SECONDS);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "ارسال کد با خطا مواجه شد");
      }
    });
  };

  const handleRegisterVerifyOtp = () => {
    setOtpError("");

    const otpValidation = otpSchema.safeParse(normalizeOtp(otp));

    if (!otpValidation.success) {
      setOtpError(otpValidation.error.issues[0]?.message ?? "کد تایید معتبر نیست");
      return;
    }

    startTransition(async () => {
      try {
        const response = await verifyOTP({
          phone_number: normalizePhoneNumberForApi(mobile),
          otp: otpValidation.data,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        });

        if (!response.success) {
          toast.error(response.message || "ثبت نام با خطا مواجه شد");
          return;
        }

        toast.success(response.message || "ثبت نام موفقیت آمیز بود");
        router.push("/chats");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "ثبت نام با خطا مواجه شد");
      }
    });
  };

  const handleResend = () => {
    if (secondsLeft > 0 || isPending) {
      return;
    }

    const validation = mobileSchema.safeParse({ mobile });

    if (!validation.success) {
      setMobileError(validation.error.issues[0]?.message ?? "شماره موبایل معتبر نیست");
      return;
    }

    startTransition(async () => {
      try {
        const response = await requestOTP({ phone_number: validation.data.mobile });

        if (!response.success) {
          toast.error(response.message || "ارسال مجدد کد ناموفق بود");
          return;
        }

        toast.success(response.message || "کد تایید مجددا ارسال شد");
        setSecondsLeft(RESEND_INITIAL_SECONDS);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "ارسال مجدد کد ناموفق بود");
      }
    });
  };

  return (
    <AuthShell>
      <AuthFlowToast />

      <AuthCard>
        <AnimatePresence mode="wait" initial={false}>
          {isLogin ? (
            step === "details" ? (
              <AuthMobileStep
                mode="login"
                mobile={mobile}
                mobileError={mobileError}
                isPending={isPending}
                onMobileChange={setMobile}
                onRequestOtp={handleLoginRequestOtp}
              />
            ) : (
              <AuthOtpStep
                isLogin
                mobile={mobile}
                otp={otp}
                otpError={otpError}
                otpLength={OTP_LENGTH}
                isPending={isPending}
                secondsLeft={secondsLeft}
                formattedTimer={formattedTimer}
                onOtpChange={setOtp}
                onResend={handleResend}
                onVerifyOtp={handleLoginVerifyOtp}
              />
            )
          ) : step === "details" ? (
            <AuthRegisterStep
              firstName={firstName}
              lastName={lastName}
              mobile={mobile}
              firstNameError={firstNameError}
              lastNameError={lastNameError}
              mobileError={mobileError}
              isPending={isPending}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onMobileChange={setMobile}
              onRequestOtp={handleRegisterRequestOtp}
            />
          ) : (
            <AuthOtpStep
              isLogin={false}
              mobile={mobile}
              otp={otp}
              otpError={otpError}
              otpLength={OTP_LENGTH}
              isPending={isPending}
              secondsLeft={secondsLeft}
              formattedTimer={formattedTimer}
              onOtpChange={setOtp}
              onResend={handleResend}
              onVerifyOtp={handleRegisterVerifyOtp}
              submitLabel="ثبت نام"
            />
          )}
        </AnimatePresence>
      </AuthCard>
    </AuthShell>
  );
};

export default AuthFlow;
