"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "../stores/session-store";

type Message = {
  message: string;
  sender?: string;
  [key: string]: any;
};

export function useChatWebSocket() {
  const { session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = session?.access;
    const baseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL;

    if (!token || !baseUrl) return;

    const ws = new WebSocket(`${baseUrl}?token=${token}`);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to native WebSocket");
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log("Disconnected from native WebSocket");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onmessage = (event) => {
      try {
        const data: Message = JSON.parse(event.data);
        console.log(data)
        setMessages((prev) => [...prev, data]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            message: event.data,
          },
        ]);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setIsConnected(false);
    };
  }, [session?.access]);

  const sendMessage = useCallback((message: string) => {
    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected");
      return;
    }

    ws.send(JSON.stringify({ message }));
  }, []);

  return {
    messages,
    sendMessage,
    isConnected,
  };
}