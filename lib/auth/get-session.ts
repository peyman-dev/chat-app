import "server-only";

import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  type SessionUser,
  validateSessionToken,
} from "@/lib/auth/session-token";

export type Session = SessionUser;

export const decryptSession = async (sessionCookie: string): Promise<Session | null> => {
  return validateSessionToken(sessionCookie);
};

export const getSession = async (): Promise<Session | null> => {
  try {
    const cookieStore = await cookies();
    const cookieName = (process.env.TOKEN_COOKIE_NAME as string) || SESSION_COOKIE_NAME;
    const sessionCookie = cookieStore.get(cookieName)?.value;

    if (!sessionCookie) {
      return null;
    }

    return await decryptSession(sessionCookie);
  } catch {
    return null;
  }
};
