"use client";

import { Copy, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

type MessageActionsProps = {
  side: "right" | "left";
  text: string;
  showFeedback?: boolean;
  className?: string;
};

const baseButtonClassName =
  "grid size-8 place-items-center rounded-full text-[#6b78a9] outline-none transition hover:bg-black/5 hover:text-[#31478b] focus-visible:ring-2 focus-visible:ring-[#5f8bdf]/50 dark:text-[#b7c2f6] dark:hover:bg-white/10 dark:hover:text-white";

const MessageActions = ({ side, text, showFeedback = false, className }: MessageActionsProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op: clipboard can fail on insecure contexts
    }
  };

  return (
    <div className={cn("mt-2.5 flex items-center gap-1", side === "right" ? "justify-end" : "justify-start", className)}>
      {showFeedback ? (
        <>
          <button type="button" aria-label="پسندیدن پاسخ" className={baseButtonClassName}>
            <ThumbsUp className="size-4" />
          </button>
          <button type="button" aria-label="نپسندیدن پاسخ" className={baseButtonClassName}>
            <ThumbsDown className="size-4" />
          </button>
          <button type="button" aria-label="تولید مجدد پاسخ" className={baseButtonClassName}>
            <RefreshCw className="size-4" />
          </button>
        </>
      ) : null}

      <button type="button" aria-label="کپی پیام" className={baseButtonClassName} onClick={handleCopy}>
        <Copy className="size-4" />
      </button>
    </div>
  );
};

export default MessageActions;
