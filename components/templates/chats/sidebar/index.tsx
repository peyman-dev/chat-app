"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useChatStore } from "@/lib/stores/chat-store";
import ChatHistorySection, { SidebarChatItem } from "./chat-history-section";
import MobileSidebarDrawer from "./mobile-sidebar-drawer";
import MobileSidebarToggle from "./mobile-sidebar-toggle";
import NewChatButton from "./new-chat-button";
import SidebarContainer from "./sidebar-container";
import SidebarFooter from "./sidebar-footer";
import SidebarHeader from "./sidebar-header";

const Sidebar = () => {
  const router = useRouter();
  const params = useParams<{ chatId?: string | string[] }>();
  const summaries = useChatStore((state) => state.summaries);
  const createChat = useChatStore((state) => state.createChat);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false,
  );

  const activeChatId = useMemo(() => {
    const chatId = params?.chatId;

    if (Array.isArray(chatId)) {
      return chatId[0] ?? null;
    }

    return chatId ?? null;
  }, [params]);

  const chatItems = useMemo<SidebarChatItem[]>(() => {
    return Object.values(summaries)
      .sort((first, second) => second.updatedAt - first.updatedAt)
      .map((summary) => ({
        chatId: summary.id,
        title: summary.title,
      }));
  }, [summaries]);

  const handleCreateChat = () => {
    const chatId = nanoid(14);
    createChat(chatId);
    router.push(`/chats/${chatId}`);
    setIsDrawerOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    router.push(`/chats/${chatId}`);
    setIsDrawerOpen(false);
  };

  const handleToggleTheme = () => {
    const root = document.documentElement;
    const nextDarkMode = !root.classList.contains("dark");

    root.classList.toggle("dark", nextDarkMode);
    setIsDarkMode(nextDarkMode);
    window.localStorage.setItem("theme", nextDarkMode ? "dark" : "light");
  };

  const sidebarBody = (
    <SidebarContainer>
      <SidebarHeader onMenuClick={() => setIsDrawerOpen(false)} />
      <NewChatButton onClick={handleCreateChat} />
      <ChatHistorySection items={chatItems} activeChatId={activeChatId} onSelect={handleSelectChat} />
      <SidebarFooter isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} />
    </SidebarContainer>
  );

  return (
    <>
      <MobileSidebarToggle onClick={() => setIsDrawerOpen(true)} />

      <motion.aside
        initial={{ x: 24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="hidden h-dvh w-[392px] shrink-0 lg:block"
      >
        {sidebarBody}
      </motion.aside>

      <MobileSidebarDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {sidebarBody}
      </MobileSidebarDrawer>
    </>
  );
};

export default Sidebar;
