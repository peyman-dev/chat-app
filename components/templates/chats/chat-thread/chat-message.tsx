import type { ChatMessage as ChatMessageType } from "@/lib/stores/chat-store";
import AssistantMessageCard from "@/components/templates/chats/chat-thread/assistant-message-card";
import UserMessageCard from "@/components/templates/chats/chat-thread/user-message-card";

type ChatMessageProps = {
  message: ChatMessageType;
  groupedWithPrevious?: boolean;
};

const ChatMessage = ({ message, groupedWithPrevious = false }: ChatMessageProps) => {
  if (message.role === "assistant") {
    return <AssistantMessageCard text={message.text} grouped={groupedWithPrevious} />;
  }

  return <UserMessageCard text={message.text} grouped={groupedWithPrevious} />;
};

export default ChatMessage;
