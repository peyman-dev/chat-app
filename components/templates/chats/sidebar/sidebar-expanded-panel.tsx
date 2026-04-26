import ChatHistorySection, { SidebarChatItem } from "./chat-history-section";
import NewChatButton from "./new-chat-button";
import SidebarContainer from "./sidebar-container";
import SidebarFooter from "./sidebar-footer";
import SidebarHeader from "./sidebar-header";

type SidebarExpandedPanelProps = {
  items: SidebarChatItem[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreateChat: () => void;
  onToggle: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isMobile?: boolean;
};

const SidebarExpandedPanel = ({
  items,
  activeChatId,
  onSelect,
  onCreateChat,
  onToggle,
  isDarkMode,
  onToggleTheme,
  isMobile = false,
}: SidebarExpandedPanelProps) => {
  console.log(items)
  return (
    <SidebarContainer>
      <SidebarHeader onToggle={onToggle} isMobile={isMobile} />
      <NewChatButton onClick={onCreateChat} />
      <ChatHistorySection items={items} activeChatId={activeChatId} onSelect={onSelect} />
      <SidebarFooter isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
    </SidebarContainer>
  );
};

export default SidebarExpandedPanel;
