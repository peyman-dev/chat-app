import { cn } from "@/lib/utils";

type MessageContentProps = {
  content: string;
  className?: string;
  showTypingCursor?: boolean;
};

const MessageContent = ({ content, className, showTypingCursor = false }: MessageContentProps) => {
  return (
    <p
      className={cn(
        "whitespace-pre-wrap break-words text-right leading-7 sm:leading-8 [overflow-wrap:anywhere]",
        className,
      )}
    >
      {content}
      {showTypingCursor ? (
        <span className="mr-1 inline-block h-[1.05em] w-0.5 animate-pulse rounded-sm bg-current align-middle" />
      ) : null}
    </p>
  );
};

export default MessageContent;
