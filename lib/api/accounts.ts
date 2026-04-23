const OTP_LENGTH = 5;

export type AuthFlowMode = "login" | "register";

export type RequestOtpPayload = {
  mobile: string;
  mode: AuthFlowMode;
};

export type VerifyOtpPayload = {
  mobile: string;
  otp: string;
  mode: AuthFlowMode;
};

type SignupResponse = {
  id?: number;
  username?: string;
  email?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseError = async (response: Response) => {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return data.detail ?? data.message ?? "خطای نامشخص در پاسخ سرور";
  } catch {
    return "امکان پردازش پاسخ سرور وجود ندارد";
  }
};

const postJson = async <T>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as T;
};

const normalizeMobileForBackend = (mobile: string) => mobile.replace(/\D+/g, "");

const buildSyntheticSignupPayload = (mobile: string) => {
  const normalizedMobile = normalizeMobileForBackend(mobile);

  return {
    username: normalizedMobile,
    email: `mobile.${normalizedMobile}@example.com`,
    password: `Mbl!${normalizedMobile}#${Date.now()}`,
  };
};

export const requestOtp = async ({ mobile }: RequestOtpPayload): Promise<void> => {
  void mobile;

  // Backend mismatch note:
  // Accounts reference currently documents only `/api/accounts/signup/` with username/password/email.
  // No OTP request endpoint is provided, so OTP request is temporarily mocked.
  await sleep(450);
};

export const verifyOtp = async ({ mobile, otp, mode }: VerifyOtpPayload): Promise<void> => {
  if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)) {
    throw new Error("کد وارد شده معتبر نیست");
  }

  if (mode === "login") {
    // Backend mismatch note:
    // Login OTP verify endpoint is not available in the provided contract, so this step is mocked.
    await sleep(450);
    return;
  }

  // Backend mismatch note:
  // Registration UI is mobile+OTP, but signup endpoint requires username/password/email.
  // We map mobile -> username and generate a synthetic email/password to keep integration isolated.
  const payload = buildSyntheticSignupPayload(mobile);
  await postJson<SignupResponse>("/api/accounts/signup/", payload);
};
