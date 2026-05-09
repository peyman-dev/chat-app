"use server";
import { getSession } from "@/lib/auth/get-session";
import { createSessionFromVerifyPayload } from "@/lib/auth/session";
import {
    normalizeContentsPage,
    normalizeSingleContent,
    type AdminContentItem,
    type AdminContentsPageData,
} from "@/lib/admin-contents";
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
        const accessToken = session?.access;

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

type GetContentsPageInput = {
    page?: number;
    pageSize?: number;
    categoryId?: string;
};

type SearchServicesInput = {
    q?: string;
    page?: number;
    pageSize?: number;
};

type GetContentsPageResponse = {
    success: boolean;
    message?: string;
    data: AdminContentsPageData;
};

type GetContentByIdResponse = {
    success: boolean;
    message?: string;
    data?: AdminContentItem;
};

type UpdateContentByIdInput = {
    contentId: string;
    title: string;
    content: string;
};

type UpdateContentByIdResponse = {
    success: boolean;
    message?: string;
    data?: AdminContentItem;
};

const getAuthorizedHeaders = async () => {
    const session = await getSession();
    const accessToken = session?.access;

    if (!accessToken) {
        return null;
    }

    return {
        Authorization: `Bearer ${accessToken}`,
    };
};

const buildFallbackPageData = (page: number, pageSize: number): AdminContentsPageData => {
    return {
        items: [],
        pagination: {
            currentPage: page,
            pageSize,
            totalCount: 0,
            totalPages: 1,
        },
    };
};

export const getContentsPage = async ({
    page = 1,
    pageSize = 20,
    categoryId,
}: GetContentsPageInput = {}): Promise<GetContentsPageResponse> => {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
    const safeCategoryId = typeof categoryId === "string" ? categoryId.trim() : "";

    try {
        const headers = await getAuthorizedHeaders();
        if (!headers) {
            return {
                success: false,
                message: "توکن دسترسی نامعتبر است",
                data: buildFallbackPageData(safePage, safePageSize),
            };
        }

        const response = await request.get("/admin/services/", {
            headers,
            params: {
                page: safePage,
                page_size: safePageSize,
                ...(safeCategoryId ? { category_id: safeCategoryId, category: safeCategoryId } : {}),
            },
        });

        return {
            success: true,
            data: normalizeContentsPage(response.data, {
                page: safePage,
                pageSize: safePageSize,
            }),
        };
    } catch (error) {
        return {
            success: false,
            message: extractAxiosErrorMessage(error),
            data: buildFallbackPageData(safePage, safePageSize),
        };
    }
};

export const getContentById = async (contentId: string): Promise<GetContentByIdResponse> => {
    const normalizedId = contentId.trim();

    if (!normalizedId) {
        return {
            success: false,
            message: "شناسه محتوا معتبر نیست",
        };
    }

    try {
        const headers = await getAuthorizedHeaders();
        if (!headers) {
            return {
                success: false,
                message: "توکن دسترسی نامعتبر است",
            };
        }

        const directEndpoints = [
            `/admin/services/${encodeURIComponent(normalizedId)}/`,
            `/admin/services/${encodeURIComponent(normalizedId)}`,
        ];

        for (const endpoint of directEndpoints) {
            try {
                const directResponse = await request.get(endpoint, { headers });
                const normalized = normalizeSingleContent(directResponse.data);
                if (normalized) {
                    return {
                        success: true,
                        data: normalized,
                    };
                }
            } catch {
                // Try next endpoint pattern.
            }
        }

        const listResponse = await request.get("/admin/services/", { headers });
        const pageData = normalizeContentsPage(listResponse.data, { page: 1, pageSize: 500 });
        const matched = pageData.items.find((item) => item.id === normalizedId);

        if (!matched) {
            return {
                success: false,
                message: "محتوا پیدا نشد",
            };
        }

        return {
            success: true,
            data: matched,
        };
    } catch (error) {
        return {
            success: false,
            message: extractAxiosErrorMessage(error),
        };
    }
};

export const updateContentById = async ({
    contentId,
    title,
    content,
}: UpdateContentByIdInput): Promise<UpdateContentByIdResponse> => {
    const normalizedId = contentId.trim();
    if (!normalizedId) {
        return {
            success: false,
            message: "شناسه محتوا معتبر نیست",
        };
    }

    try {
        const headers = await getAuthorizedHeaders();
        if (!headers) {
            return {
                success: false,
                message: "توکن دسترسی نامعتبر است",
            };
        }

        const payload = {
            title: title.trim(),
            content: content.trim(),
        };

        const endpoints = [
            `/admin/services/${encodeURIComponent(normalizedId)}/`,
            `/admin/services/${encodeURIComponent(normalizedId)}`,
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await request.patch(endpoint, payload, { headers });
                const normalized = normalizeSingleContent(response.data);
                if (normalized) {
                    return {
                        success: true,
                        data: normalized,
                    };
                }

                return {
                    success: true,
                    data: {
                        id: normalizedId,
                        title: payload.title || "بدون عنوان",
                        content: payload.content,
                        updatedAt: null,
                        raw: {},
                    },
                };
            } catch {
                // Try next endpoint pattern.
            }
        }

        return {
            success: false,
            message: "بروزرسانی محتوا ناموفق بود",
        };
    } catch (error) {
        return {
            success: false,
            message: extractAxiosErrorMessage(error),
        };
    }
};

export const getServices = async () => {
    const response = await getContentsPage();

    if (!response.success) {
        return {
            success: false,
            message: response.message ?? "خطا در دریافت اطلاعات",
        };
    }

    return {
        success: true,
        data: response.data.items,
        pagination: response.data.pagination,
    };
};
type UpdateServiceInput = {
    id: string;
    name: string;
    full_content: string;
};

type UpdateServiceResponse = {
    success: boolean;
    message?: string;
    data?: AdminContentItem;
};

// /admin/services/{service_id}/
export const updateService = async ({
    id,
    name,
    full_content,
}: UpdateServiceInput): Promise<UpdateServiceResponse> => {
    const normalizedId = id.trim();

    if (!normalizedId) {
        return {
            success: false,
            message: "شناسه محتوا معتبر نیست",
        };
    }

    try {
        // const headers = await getAuthorizedHeaders();
        const session = await getSession();
        const accessToken = await session?.access

        const payload = {
            title: name.trim(),
            full_content: full_content.trim(),
        };

        console.log(payload)
        const response = await request.put(`/admin/services/${id}/`, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const normalized = normalizeSingleContent(response.data);
        if (normalized) {
            return {
                success: true,
                data: normalized,
            };
        }

        return {
            success: true,
            data: {
                id: normalizedId,
                title: payload.title || "بدون عنوان",
                content: payload.full_content,
                updatedAt: null,
                raw: isRecord(response.data) ? response.data : {},
            },
        };
    } catch (error) {
        return {
            success: false,
            message: extractAxiosErrorMessage(error),
        };
    }
};


// 

export const getCategories = async () => {
    try {
        const session = await getSession();
        const accessToken = await session?.access

        const response = await request.get("/admin/categories/", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })

        const data = await response.data
        return data
    } catch (error) {
        return {
            success: false,
            error
        }
    }
}



// /admin/search/
// GET /admin/services/search/?q=ضمانت

export const searchServices = async ({
    q,
    page = 1,
    pageSize = 20,
}: SearchServicesInput = {}): Promise<GetContentsPageResponse> => {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
    const safeQ = typeof q === "string" ? q.trim() : "";

    try {
        const headers = await getAuthorizedHeaders();
        if (!headers) {
            return {
                success: false,
                message: "توکن دسترسی نامعتبر است",
                data: buildFallbackPageData(safePage, safePageSize),
            };
        }

        const response = await request.get("/admin/search/", {
            headers,
            params: {
                q: safeQ,
            }
        });

        return {
            success: true,
            data: normalizeContentsPage(response.data, {
                page: safePage,
                pageSize: safePageSize,
            }),
        };
    } catch (error) {
        return {
            success: false,
            message: extractAxiosErrorMessage(error),
            data: buildFallbackPageData(safePage, safePageSize),
        };
    }
}


// /admin/schedule/
// admin_schedule_create


// Every 24 hours (daily)
// Runs once per day (e.g. midnight)
// {
// "minute": "0",
// "hour": "0",
// "day_of_week": "",
// "day_of_month": "",
// "month_of_year": "*"
// }

// Every 7 days (weekly)
// {
// "minute": "0",
// "hour": "0",
// "day_of_week": "0",
// "day_of_month": "",
// "month_of_year": ""
// }
// Every 14 days (bi-weekly)

// 14-day intervals
// {
// "minute": "0",
// "hour": "0",
// "day_of_week": "",
// "day_of_month": "/14",
// "month_of_year": "*"
// }

// Every 30 days (monthly)
// {
// "minute": "0",
// "hour": "0",
// "day_of_week": "",
// "day_of_month": "1",
// "month_of_year": ""
// }


export const setSchedule = async (payload: {
    minute: string,
    hour: string,
    day_of_week: string,
    day_of_month: string,
    month_of_year: string,
}) => {
    try {
        const session = await getSession();
        const accessToken = await session?.access;

        const response = await request.post("/admin/schedule", payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        const data = await response.data
        return data
    } catch (error) {
        return {
            success: false,
            
        }
    }
}