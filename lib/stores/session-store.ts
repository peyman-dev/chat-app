"use client";

import { create } from "zustand";
import { logOutAction, validateSessionAction } from "@/app/session.actions";
import type { SessionUser } from "@/lib/auth/session-token";

type SessionStatus = "authenticated" | "loading" | "unauthenticated";

type SessionStore = {
  session: SessionUser | null;
  status: SessionStatus;
  validateSession: () => Promise<SessionUser | null>;
  logOut: () => Promise<void>;
};

export const useSession = create<SessionStore>((set) => ({
  session: null,
  status: "loading", // معمولا اول کار loading هست

  validateSession: async () => {
    set({ status: "loading" });

    try {
      const nextSession = await validateSessionAction();

      if (nextSession) {
        set({
          session: nextSession,
          status: "authenticated",
        });
      } else {
        set({
          session: null,
          status: "unauthenticated",
        });
      }

      return nextSession;
    } catch {
      set({
        session: null,
        status: "unauthenticated",
      });
      return null;
    }
  },

  logOut: async () => {
    set({ status: "loading" });

    try {
      await logOutAction();
    } finally {
      set({
        session: null,
        status: "unauthenticated",
      });
    }
  },
}));