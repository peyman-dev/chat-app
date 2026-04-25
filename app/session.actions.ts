"use server";

import { clearSessionCookie, getSessionFromServerCookies } from "@/lib/auth/session";

export const validateSessionAction = async () => {
  return getSessionFromServerCookies();
};

export const logOutAction = async () => {
  await clearSessionCookie();
  return { success: true };
};

