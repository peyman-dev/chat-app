"use server"

type RequestOTPResponse = {
  success: boolean
  message: string
  data: {
    phone_number: string
    is_new: boolean
  }
}

type VerifyOTPResponse = {
  success: boolean
  message: string
  data?: {
    tokens: {
      refresh: string
      access: string
    }
  }
  user?: {
    id: number
    phone_number: string
    first_name: string
    last_name: string
  }
}

const DEFAULT_ERROR_MESSAGE = "خطا در ارتباط با سرور"

const getBaseUrl = () => {
  const baseUrl = process.env.BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error("BASE_URL is not set")
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
}

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${getBaseUrl()}${normalizedPath}`
}

const extractMessage = (payload: unknown, fallback: string) => {
  if (typeof payload !== "object" || payload === null) {
    return fallback
  }

  const data = payload as Record<string, unknown>

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message
  }

  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail
  }

  return fallback
}

const postJson = async <T>(path: string, body: Record<string, unknown>) => {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  let payload: T | null = null

  try {
    payload = (await response.json()) as T
  } catch {
    payload = null
  }

  return { response, payload }
}

export const requestOTP = async ({ phone_number }: { phone_number: string }): Promise<RequestOTPResponse> => {
  try {
    const { response, payload } = await postJson<Partial<RequestOTPResponse>>("/request-otp/", { phone_number })

    if (!response.ok || !payload) {
      return {
        success: false,
        message: extractMessage(payload, "ارسال کد تایید ناموفق بود"),
        data: {
          phone_number,
          is_new: false,
        },
      }
    }

    return {
      success: Boolean(payload.success),
      message: payload.message ?? "",
      data: {
        phone_number: payload.data?.phone_number ?? phone_number,
        is_new: Boolean(payload.data?.is_new),
      },
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
      data: {
        phone_number,
        is_new: false,
      },
    }
  }
}

export const verifyOTP = async ({
  phone_number,
  otp,
  first_name,
  last_name,
}: {
  phone_number: string
  otp: string
  first_name?: string
  last_name?: string
}): Promise<VerifyOTPResponse> => {
  const commonFields: Record<string, unknown> = {
    phone_number,
  }

  if (first_name?.trim()) {
    commonFields.first_name = first_name.trim()
  }

  if (last_name?.trim()) {
    commonFields.last_name = last_name.trim()
  }

  try {
    const primaryAttempt = await postJson<Partial<VerifyOTPResponse>>("/verify-otp/", {
      ...commonFields,
      otp,
    })

    if (primaryAttempt.response.ok && primaryAttempt.payload) {
      return {
        success: Boolean(primaryAttempt.payload.success),
        message: primaryAttempt.payload.message ?? "",
        data: primaryAttempt.payload.data,
        user: primaryAttempt.payload.user,
      }
    }

    const fallbackAttempt = await postJson<Partial<VerifyOTPResponse>>("/verify-otp/", {
      ...commonFields,
      code: otp,
    })

    if (!fallbackAttempt.response.ok || !fallbackAttempt.payload) {
      return {
        success: false,
        message: extractMessage(
          fallbackAttempt.payload ?? primaryAttempt.payload,
          "تایید کد ناموفق بود",
        ),
      }
    }

    return {
      success: Boolean(fallbackAttempt.payload.success),
      message: fallbackAttempt.payload.message ?? "",
      data: fallbackAttempt.payload.data,
      user: fallbackAttempt.payload.user,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
    }
  }
}
