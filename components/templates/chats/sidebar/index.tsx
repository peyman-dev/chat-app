"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { AnimatePresence, motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { useChatStore } from "@/lib/stores/chat-store";
import { SidebarChatItem } from "./chat-history-section";
import MobileSidebarDrawer from "./mobile-sidebar-drawer";
import MobileSidebarToggle from "./mobile-sidebar-toggle";
import SidebarExpandedPanel from "./sidebar-expanded-panel";
import SidebarRail from "./sidebar-rail";

const Sidebar = () => {
  const router = useRouter();
  const params = useParams<{ chatId?: string | string[] }>();
  const summaries = useChatStore((state) => state.summaries);
  const createChat = useChatStore((state) => state.createChat);
  const { isDarkMode, toggleTheme } = useTheme();

  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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
    setIsMobileDrawerOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    router.push(`/chats/${chatId}`);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      <MobileSidebarToggle onClick={() => setIsMobileDrawerOpen(true)} />

      <motion.aside
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0, width: isDesktopCollapsed ? 92 : 360 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="hidden h-dvh shrink-0 overflow-hidden bg-[#d7dce8] dark:bg-[#0b1140] lg:block"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDesktopCollapsed ? (
            <motion.div
              key="sidebar-rail"
              initial={{ x: 8 }}
              animate={{ x: 0 }}
              exit={{ x: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <SidebarRail
                items={chatItems}
                activeChatId={activeChatId}
                onSelect={handleSelectChat}
                onCreateChat={handleCreateChat}
                onToggle={() => setIsDesktopCollapsed(false)}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
              />
            </motion.div>
          ) : (
            <motion.div
              key="sidebar-expanded"
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              exit={{ x: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <SidebarExpandedPanel
                items={chatItems}
                activeChatId={activeChatId}
                onSelect={handleSelectChat}
                onCreateChat={handleCreateChat}
                onToggle={() => setIsDesktopCollapsed(true)}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      <MobileSidebarDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)}>
        <SidebarExpandedPanel
          items={chatItems}
          activeChatId={activeChatId}
          onSelect={handleSelectChat}
          onCreateChat={handleCreateChat}
          onToggle={() => setIsMobileDrawerOpen(false)}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          isMobile
        />
      </MobileSidebarDrawer>
    </>
  );
};

export default Sidebar;
