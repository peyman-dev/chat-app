"use client";

import { ChatWebSocketProvider } from "@/lib/hooks/socket";
import { ReactNode } from "react";

const SocketProvider = ({ children }: { children: ReactNode }) => {
  return <ChatWebSocketProvider>{children}</ChatWebSocketProvider>;
};

export default SocketProvider;
