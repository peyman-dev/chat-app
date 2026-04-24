import { z } from "zod";

export const toEnglishDigits = (value: string) => {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
};

export const normalizePhoneNumberForApi = (value: string) => {
  const english = toEnglishDigits(value).trim().replace(/\s+/g, "");

  if (english.startsWith("+98")) {
    return `0${english.slice(3).replace(/\D+/g, "")}`;
  }

  if (english.startsWith("0098")) {
    return `0${english.slice(4).replace(/\D+/g, "")}`;
  }

  const digits = english.replace(/\D+/g, "");

  if (digits.startsWith("98")) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("9")) {
    return `0${digits}`;
  }

  return digits;
};

export const mobileSchema = z.object({
  mobile: z
    .string()
    .trim()
    .min(1, "شماره موبایل را وارد کنید")
    .transform((value) => normalizePhoneNumberForApi(value))
    .refine((value) => /^0\d{10,11}$/.test(value), {
      message: "فرمت شماره موبایل معتبر نیست",
    }),
});

export const registerProfileSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "نام را وارد کنید"),
  last_name: z
    .string()
    .trim()
    .min(1, "نام خانوادگی را وارد کنید"),
});

export const normalizeOtp = (value: string) => {
  return toEnglishDigits(value).replace(/\D+/g, "");
};

export const createOtpSchema = (otpLength: number) => {
  return z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${otpLength}}$`), `کد تایید باید ${otpLength} رقم باشد`);
};
