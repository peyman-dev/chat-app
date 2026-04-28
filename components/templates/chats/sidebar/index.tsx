"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { AnimatePresence, motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { useChatStore } from "@/lib/stores/chat-store";
import MobileSidebarDrawer from "./mobile-sidebar-drawer";
import MobileSidebarToggle from "./mobile-sidebar-toggle";
import SidebarExpandedPanel from "./sidebar-expanded-panel";
import SidebarRail from "./sidebar-rail";
import { getHistory } from "@/app/actions";
import { useQuery } from '@tanstack/react-query'

const SIDEBAR_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const Sidebar = () => {
  const router = useRouter();
  const params = useParams<{ chatId?: string | string[] }>();
  const createChat = useChatStore((state) => state.createChat);
  const { isDarkMode, toggleTheme } = useTheme();
  const { data, isLoading, isError } = useQuery({
    queryFn: getHistory,
    queryKey: ["recent-chats"]
  })

  console.log(data)


  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const activeChatId = useMemo(() => {
    const chatId = params?.chatId;

    if (Array.isArray(chatId)) {
      return chatId[0] ?? null;
    }

    return chatId ?? null;
  }, [params]);


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

  if (isLoading) return "Please wait ... "
  if (isError) return "An error occurred"

  console.log(isError)

  return (
    <>
      <MobileSidebarToggle onClick={() => setIsMobileDrawerOpen(true)} />

      <motion.aside
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0, width: isDesktopCollapsed ? 92 : 360 }}
        transition={{ duration: 0.34, ease: SIDEBAR_EASE }}
        layout
        className="hidden h-dvh shrink-0 overflow-hidden bg-[#d7dce8] dark:bg-[#0b1140] lg:block"
      >
        <AnimatePresence mode="sync" initial={false}>
          {isDesktopCollapsed ? (
            <motion.div
              key="sidebar-rail"
              initial={{ x: 10, opacity: 0, scale: 0.985, filter: "blur(5px)" }}
              animate={{ x: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ x: 8, opacity: 0, scale: 0.99, filter: "blur(4px)" }}
              transition={{ duration: 0.26, ease: SIDEBAR_EASE }}
              layout
              className="h-full"
            >
              <SidebarRail
                items={Array.from(data?.data)}
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
              initial={{ x: -12, opacity: 0, scale: 0.985, filter: "blur(5px)" }}
              animate={{ x: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ x: -8, opacity: 0, scale: 0.99, filter: "blur(4px)" }}
              transition={{ duration: 0.28, ease: SIDEBAR_EASE }}
              layout
              className="h-full"
            >
              <SidebarExpandedPanel
                items={(data?.data)}
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
          items={(data?.data)}
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