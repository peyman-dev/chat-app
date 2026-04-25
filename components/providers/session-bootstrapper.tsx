"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/stores/session-store";

const SessionBootstrapper = () => {
  const router = useRouter();
  const validateSession = useSession((state) => state.validateSession);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const currentSession = await validateSession();
      if (cancelled) {
        return;
      }

      const pathname = window.location.pathname;
      const isAuthRoute = pathname.startsWith("/auth");

      if (!currentSession && !isAuthRoute) {
        router.replace("/auth/login");
        return;
      }

      if (currentSession && isAuthRoute) {
        router.replace("/chats");
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, validateSession]);

  return null;
};

export default SessionBootstrapper;

