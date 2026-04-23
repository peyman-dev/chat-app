"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { z } from "zod";
import AuthCard from "@/components/templates/auth/auth-card";
import AuthHeader from "@/components/templates/auth/auth-header";
import AuthShell from "@/components/templates/auth/auth-shell";
import AuthSubmitButton from "@/components/templates/auth/auth-submit-button";
import MobileInput from "@/components/templates/auth/mobile-input";
import OtpInput from "@/components/templates/auth/otp-input";
import SocialLoginButton from "@/components/templates/auth/social-login-button";
import { requestOtp, verifyOtp } from "@/lib/api/accounts";

type AuthFlowProps = {
  mode: "login" | "register";
};

const OTP_LENGTH = 5;
const RESEND_INITIAL_SECONDS = 56;

const mobileSchema = z.object({
  mobile: z
    .string()
    .trim()
    .min(1, "شماره موبایل را وارد کنید")
    .transform((value) => value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))))
    .refine((value) => /^(\+98|0)?9\d{9}$/.test(value.replace(/\s+/g, "")), {
      message: "فرمت شماره موبایل معتبر نیست",
    }),
});

const otpSchema = z
  .string()
  .trim()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `کد تایید باید ${OTP_LENGTH} رقم باشد`);

const toEnglishDigits = (value: string) => {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
};

const sanitizeMobile = (value: string) => toEnglishDigits(value).replace(/\s+/g, "");

const AuthFlow = ({ mode }: AuthFlowProps) => {
  const router = useRouter();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_INITIAL_SECONDS);
  const [bannerMessage, setBannerMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isLogin = mode === "login";

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
  }, [secondsLeft, step]);

  useEffect(() => {
    if (!bannerMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBannerMessage("");
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bannerMessage]);

  const formattedTimer = useMemo(() => {
    return `0:${String(secondsLeft).padStart(2, "0")}`;
  }, [secondsLeft]);

  const handleRequestOtp = () => {
    setMobileError("");

    const result = mobileSchema.safeParse({ mobile: sanitizeMobile(mobile) });

    if (!result.success) {
      setMobileError(result.error.issues[0]?.message ?? "شماره موبایل معتبر نیست");
      return;
    }

    startTransition(async () => {
      try {
        await requestOtp({ mobile: result.data.mobile, mode });
        setMobile(result.data.mobile);
        setOtp("");
        setOtpError("");
        setStep("otp");
        setSecondsLeft(RESEND_INITIAL_SECONDS);
      } catch (error) {
        setBannerMessage(error instanceof Error ? error.message : "ارسال کد با خطا مواجه شد");
      }
    });
  };

  const handleVerifyOtp = () => {
    setOtpError("");

    const normalizedOtp = toEnglishDigits(otp).replace(/\D+/g, "");
    const validation = otpSchema.safeParse(normalizedOtp);

    if (!validation.success) {
      setOtpError(validation.error.issues[0]?.message ?? "کد تایید معتبر نیست");
      return;
    }

    startTransition(async () => {
      try {
        await verifyOtp({
          mobile: sanitizeMobile(mobile),
          otp: validation.data,
          mode,
        });

        router.push("/chats");
      } catch (error) {
        setBannerMessage(error instanceof Error ? error.message : "تایید کد با خطا مواجه شد");
      }
    });
  };

  const handleResend = () => {
    if (secondsLeft > 0 || isPending) {
      return;
    }

    startTransition(async () => {
      try {
        await requestOtp({ mobile: sanitizeMobile(mobile), mode });
        setOtp("");
        setOtpError("");
        setSecondsLeft(RESEND_INITIAL_SECONDS);
      } catch (error) {
        setBannerMessage(error instanceof Error ? error.message : "ارسال مجدد کد ناموفق بود");
      }
    });
  };

  return (
    <AuthShell>
      <AnimatePresence>
        {bannerMessage ? (
          <motion.p
            key={bannerMessage}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="auth-toast"
            role="status"
            aria-live="polite"
          >
            {bannerMessage}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <AuthCard>
        <AnimatePresence mode="wait" initial={false}>
          {step === "mobile" ? (
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
                    handleRequestOtp();
                  }}
                  className="space-y-4"
                >
                  <MobileInput
                    value={mobile}
                    onChange={setMobile}
                    onSubmit={handleRequestOtp}
                    disabled={isPending}
                    error={mobileError}
                  />
                </form>
{/* 
                <div className="relative py-1">
                  <div className="h-px w-full bg-[#9ba3c2]/35 dark:bg-white/20" />
                  <span className="absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 bg-transparent px-2 text-sm font-semibold text-[#64659a] dark:text-white/65">
                    یا
                  </span>
                </div> */}

                {/* <SocialLoginButton /> */}

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
          ) : (
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
                  کد {OTP_LENGTH} رقمی ارسال شده به موبایل خود را وارد کنید
                </p>

                <OtpInput value={otp} onChange={setOtp} disabled={isPending} length={OTP_LENGTH} error={otpError} />

                <p className="text-sm font-bold text-[#6c6fa0] dark:text-white/60">
                  {secondsLeft > 0 ? (
                    <>
                      ارسال دوباره کد <span dir="ltr">{formattedTimer}</span>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="text-[#16c7bf] outline-none transition hover:opacity-90 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#16c7bf]/50"
                      onClick={handleResend}
                    >
                      ارسال مجدد کد
                    </button>
                  )}
                </p>
              </div>

              <div className="mt-18 sm:mt-20">
                <AuthSubmitButton onClick={handleVerifyOtp} loading={isPending}>
                  تایید
                </AuthSubmitButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AuthCard>
    </AuthShell>
  );
};

export default AuthFlow;
