"use server";
import { getSession } from "@/lib/auth/get-session";
import { createSessionFromVerifyPayload } from "@/lib/auth/session";
import { request } from "@/lib/axios";
import { configDotenv } from "dotenv";

configDotenv()

type RequestOTPResponse = {
    success: boolean;
    message: string;
    data: {
        phone_number: string;
        is_new: boolean;
    };
};

type VerifyTokens = {
    refresh: string;
    access: string;
};

type VerifyUser = {
    id: number;
    phone_number: string;
    first_name: string | null;
    last_name: string | null;
};

type VerifyOTPResponse = {
    success: boolean;
    status_code?: number;
    message: string;
    data: {
        is_new: boolean;
        tokens?: VerifyTokens;
        user?: VerifyUser;
    };
};

const DEFAULT_ERROR_MESSAGE = "خطا در ارتباط با سرور";

const getBaseUrl = () => {
    const baseUrl = process.env.BASE_URL?.trim();

    if (!baseUrl) {
        throw new Error("BASE_URL is not set");
    }

    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

const buildUrl = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${getBaseUrl()}${normalizedPath}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

const toOptionalString = (value: unknown) => {
    return typeof value === "string" ? value : undefined;
};

const toNullableString = (value: unknown) => {
    if (typeof value === "string") {
        return value;
    }

    if (value === null || value === undefined) {
        return null;
    }

    return null;
};

const toOptionalNumber = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
        return Number(value);
    }

    return undefined;
};

const extractMessage = (payload: unknown, fallback: string) => {
    if (!isRecord(payload)) {
        return fallback;
    }

    if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
    }

    if (typeof payload.detail === "string" && payload.detail.trim()) {
        return payload.detail;
    }

    if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error;
    }

    return fallback;
};

const postJson = async <T>(path: string, body: Record<string, unknown>) => {
    const response = await fetch(buildUrl(path), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    let payload: T | null = null;

    try {
        payload = (await response.json()) as T;
    } catch {
        payload = null;
    }

    return { response, payload };
};

const normalizeVerifyPayload = (payload: unknown): VerifyOTPResponse | null => {
    if (!isRecord(payload)) {
        return null;
    }

    const payloadData = isRecord(payload.data) ? payload.data : {};
    const tokensSource = isRecord(payloadData.tokens)
        ? payloadData.tokens
        : isRecord(payload.tokens)
            ? payload.tokens
            : null;
    const userSource = isRecord(payloadData.user)
        ? payloadData.user
        : isRecord(payload.user)
            ? payload.user
            : null;

    const access = tokensSource ? toOptionalString(tokensSource.access) : undefined;
    const refresh = tokensSource ? toOptionalString(tokensSource.refresh) : undefined;
    const userId = userSource ? toOptionalNumber(userSource.id) : undefined;
    const userPhone = userSource ? toOptionalString(userSource.phone_number) : undefined;

    const tokens =
        access && refresh
            ? {
                access,
                refresh,
            }
            : undefined;

    const user =
        userId !== undefined && userPhone
            ? {
                id: userId,
                phone_number: userPhone,
                first_name: toNullableString(userSource?.first_name),
                last_name: toNullableString(userSource?.last_name),
            }
            : undefined;

    return {
        success: Boolean(payload.success),
        status_code: toOptionalNumber(payload.status_code),
        message: typeof payload.message === "string" ? payload.message : "",
        data: {
            is_new: Boolean(payloadData.is_new),
            tokens,
            user,
        },
    };
};

export const requestOTP = async ({ phone_number }: { phone_number: string }): Promise<RequestOTPResponse> => {
    try {
        const { response, payload } = await postJson<Partial<RequestOTPResponse>>("/request-otp/", { phone_number });

        if (!response.ok || !payload) {
            return {
                success: false,
                message: extractMessage(payload, "ارسال کد تایید ناموفق بود"),
                data: {
                    phone_number,
                    is_new: false,
                },
            };
        }

        return {
            success: Boolean(payload.success),
            message: payload.message ?? "",
            data: {
                phone_number: payload.data?.phone_number ?? phone_number,
                is_new: Boolean(payload.data?.is_new),
            },
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
            data: {
                phone_number,
                is_new: false,
            },
        };
    }
};

export const verifyOTP = async ({
    phone_number,
    otp,
    first_name,
    last_name,
}: {
    phone_number: string;
    otp: string;
    first_name?: string;
    last_name?: string;
}): Promise<VerifyOTPResponse> => {
    const commonFields: Record<string, unknown> = {
        phone_number,
    };

    if (first_name?.trim()) {
        commonFields.first_name = first_name.trim();
    }

    if (last_name?.trim()) {
        commonFields.last_name = last_name.trim();
    }

    try {
        const primaryAttempt = await postJson("/verify-otp/", {
            ...commonFields,
            otp,
        });
        const primaryNormalized = normalizeVerifyPayload(primaryAttempt.payload);

        if (primaryAttempt.response.ok && primaryNormalized) {
            if (primaryNormalized.success && primaryNormalized.data.tokens && primaryNormalized.data.user) {
                await createSessionFromVerifyPayload({
                    user: primaryNormalized.data.user,
                    tokens: primaryNormalized.data.tokens,
                    fallbackFirstName: first_name,
                    fallbackLastName: last_name,
                    fallbackPhoneNumber: phone_number,
                });
            }

            return primaryNormalized;
        }

        const fallbackAttempt = await postJson("/verify-otp/", {
            ...commonFields,
            code: otp,
        });
        const fallbackNormalized = normalizeVerifyPayload(fallbackAttempt.payload);

        if (!fallbackAttempt.response.ok || !fallbackNormalized) {
            return {
                success: false,
                message: extractMessage(
                    fallbackAttempt.payload ?? primaryAttempt.payload,
                    "تایید کد ناموفق بود",
                ),
                data: {
                    is_new: false,
                },
            };
        }

        if (fallbackNormalized.success && fallbackNormalized.data.tokens && fallbackNormalized.data.user) {
            await createSessionFromVerifyPayload({
                user: fallbackNormalized.data.user,
                tokens: fallbackNormalized.data.tokens,
                fallbackFirstName: first_name,
                fallbackLastName: last_name,
                fallbackPhoneNumber: phone_number,
            });
        }

        return fallbackNormalized;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
            data: {
                is_new: false,
            },
        };
    }
};



export const getHistory = async () => {
    try {
        const session = await getSession()
        const accessToken = await session?.access;

        const response = await request.get("/chats/", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        const data = await response.data
        return data
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
        }

    }
}



// /check/

export const checkUserRegisteration = async (phone_number: string) => {
    try {
        const response = await request.get(`/check/?phone=${phone_number}`)
        const data = await response.data
        return data
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
        }

    }
}
