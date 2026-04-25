"use client";

import { create } from "zustand";
import { logOutAction, validateSessionAction } from "@/app/session.actions";
import type { SessionUser } from "@/lib/auth/session-token";

type SessionStore = {
  session: SessionUser | null;
  validateSession: () => Promise<SessionUser | null>;
  logOut: () => Promise<void>;
};

export const useSession = create<SessionStore>((set) => ({
  session: null,
  validateSession: async () => {
    try {
      const nextSession = await validateSessionAction();
      set({ session: nextSession });
      return nextSession;
    } catch {
      set({ session: null });
      return null;
    }
  },
  logOut: async () => {
    try {
      await logOutAction();
    } finally {
      set({ session: null });
    }
  },
}));

