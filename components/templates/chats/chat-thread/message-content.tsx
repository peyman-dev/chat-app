import { cn } from "@/lib/utils";

type MessageContentProps = {
  text: string;
  className?: string;
};

const MessageContent = ({ text, className }: MessageContentProps) => {
  return (
    <p
      className={cn(
        "whitespace-pre-wrap break-words text-right leading-7 sm:leading-8 [overflow-wrap:anywhere]",
        className,
      )}
    >
      {text}
    </p>
  );
};

export default MessageContent;
