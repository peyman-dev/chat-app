import "server-only";

import { cookies } from "next/headers";
import {
  createSessionUser,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  type SessionUser,
  signSessionToken,
  validateSessionToken,
} from "@/lib/auth/session-token";

export const createSessionCookie = async (session: SessionUser) => {
  const sessionToken = await signSessionToken(session);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

export const createSessionFromVerifyPayload = async ({
  user,
  tokens,
  fallbackFirstName,
  fallbackLastName,
  fallbackPhoneNumber,
}: {
  user: {
    id: number;
    phone_number?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  };
  tokens: {
    access: string;
    refresh: string;
  };
  fallbackFirstName?: string;
  fallbackLastName?: string;
  fallbackPhoneNumber?: string;
}) => {
  const sessionUser = createSessionUser({
    id: user.id,
    first_name: user.first_name ?? fallbackFirstName,
    last_name: user.last_name ?? fallbackLastName,
    phone_number: user.phone_number ?? fallbackPhoneNumber ?? "",
    access: tokens.access,
    refresh: tokens.refresh,
  });

  await createSessionCookie(sessionUser);
  return sessionUser;
};

export const getSessionFromServerCookies = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return validateSessionToken(token);
};

export const clearSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
};

