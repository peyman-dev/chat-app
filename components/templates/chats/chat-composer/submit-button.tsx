"use client"
import { ArrowUp } from "lucide-react";
import { ButtonHTMLAttributes, useTransition } from "react";
import { cn } from "@/lib/utils";
import { useChatWebSocket } from "@/lib/hooks/socket";
import { useQueryClient } from "@tanstack/react-query";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;


const SubmitButton = ({ className, disabled, text, ...props }: SubmitButtonProps & { text: string }) => {
  const [sendingMessage, startTransition] = useTransition()
  const { sendMessage } = useChatWebSocket()
  const qClient = useQueryClient()

  const onClick = () => {
    startTransition(async () => {
      sendMessage(text)
      await qClient.invalidateQueries({
        queryKey: ['recent-chats']
      })
    })
  }
  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full bg-[#83898f] text-[#dce4eb] transition-all sm:size-[56px]",
        "border border-transparent",
        "dark:bg-[#b8bdd6] dark:text-[#1f2b7d] dark:border-[#0ea5ff]",
        "disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      {...props}
    >
      <ArrowUp className="size-6 sm:size-8" strokeWidth={2.4} />
    </button>
  );
};

export default SubmitButton;
