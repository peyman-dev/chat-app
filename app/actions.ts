"use server";
import { getSession } from "@/lib/auth/get-session";
import { createSessionFromVerifyPayload } from "@/lib/auth/session";
import { request } from "@/lib/axios";
import axios from "axios";

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

const extractAxiosErrorMessage = (error: unknown, fallback = DEFAULT_ERROR_MESSAGE) => {
    if (axios.isAxiosError(error)) {
        return extractMessage(error.response?.data, error.message || fallback);
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
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
        const response = await request.post<Partial<RequestOTPResponse>>("/request-otp/", { phone_number });
        const payload = response.data;

        if (!payload) {
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
            message: extractAxiosErrorMessage(error),
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
        const response = await request.post("/verify-otp/", {
            ...commonFields,
            code: otp,
        });
        const normalizedPayload = normalizeVerifyPayload(response.data);

        if (!normalizedPayload) {
            return {
                success: false,
                message: extractMessage(response.data, "تایید کد ناموفق بود"),
                data: {
                    is_new: false,
                },
            };
        }

        if (normalizedPayload.success && normalizedPayload.data.tokens && normalizedPayload.data.user) {
            await createSessionFromVerifyPayload({
                user: normalizedPayload.data.user,
                tokens: normalizedPayload.data.tokens,
                fallbackFirstName: first_name,
                fallbackLastName: last_name,
                fallbackPhoneNumber: phone_number,
            });
        }

        return normalizedPayload;
    } catch (error) {
        return {
            success: false,
            message: extractAxiosErrorMessage(error),
            data: {
                is_new: false,
            },
        };
    }
};



export const getHistory = async () => {
    try {
        const session = await getSession();
        const accessToken =  session?.access;

        if (!accessToken) {
            return {
                success: false,
                message: "توکن دسترسی نامعتبر است",
            };
        }
        const response = await request.get("/chats/", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        console.log(response)
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: extractAxiosErrorMessage(error),
        };
    }
};



// /check/

export const checkUserRegisteration = async (phone_number: string) => {
    try {
        const response = await request.get("/check/", {
            params: {
                phone: phone_number,
            },
        });

        return response.data;
    } catch (error) {
        return {
            success: false,
            message: extractAxiosErrorMessage(error),
        };
    }
};
