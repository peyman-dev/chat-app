import { MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { SidebarChatItem } from "./chat-history-section";
import NewChatButton from "./new-chat-button";
import SidebarContainer from "./sidebar-container";
import SidebarFooter from "./sidebar-footer";
import SidebarHeader from "./sidebar-header";

type SidebarRailProps = {
  items: SidebarChatItem[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreateChat: () => void;
  onToggle: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
};

const SidebarRail = ({
  items,
  activeChatId,
  onSelect,
  onCreateChat,
  onToggle,
  isDarkMode,
  onToggleTheme,
}: SidebarRailProps) => {
  return (
    <SidebarContainer className="px-3 pb-4 pt-4">
      <SidebarHeader collapsed onToggle={onToggle} />
      <div className="mt-2 flex flex-1 flex-col items-center">
        <NewChatButton onClick={onCreateChat} collapsed />

        <div className="mt-4 flex w-full flex-1 flex-col items-center gap-2 overflow-y-auto pb-2">
          {items.slice(0, 6).map((item) => (
            <motion.button
              key={item.chatId}
              type="button"
              onClick={() => onSelect(item.chatId)}
              whileHover={{ y: -1, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              title={item.title}
              aria-current={item.chatId === activeChatId ? "page" : undefined}
              className={[
                "grid size-10 place-items-center rounded-xl border border-transparent text-[#b7d5ff]  outline-none",
                "bg-white/7 hover:border-white/18 hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-[#81beff]/70",
                item.chatId === activeChatId ? "border-white/24 bg-white/15 text-white" : "",
              ].join(" ")}
            >
              <MessageSquare className="size-[18px]" strokeWidth={2.1} />
            </motion.button>
          ))}
        </div>
      </div>

      <SidebarFooter isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} collapsed />
    </SidebarContainer>
  );
};

export default SidebarRail;
