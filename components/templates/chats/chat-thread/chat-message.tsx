import type { ChatMessage as ChatMessageType } from "@/lib/stores/chat-store";
import AssistantMessageCard from "@/components/templates/chats/chat-thread/assistant-message-card";
import UserMessageCard from "@/components/templates/chats/chat-thread/user-message-card";

type ChatMessageProps = {
  message: ChatMessageType;
  groupedWithPrevious?: boolean;
};

const ChatMessage = ({ message, groupedWithPrevious = false }: ChatMessageProps) => {
  if (message.role === "assistant") {
    return (
      <AssistantMessageCard
        content={message.content}
        status={message.status}
        grouped={groupedWithPrevious}
      />
    );
  }

  return <UserMessageCard content={message.content} grouped={groupedWithPrevious} status={message.status} />;
};

export default ChatMessage;
