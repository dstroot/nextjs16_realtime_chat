import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Check, Bomb } from "lucide-react";

// components
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

interface ChatHeaderProps {
  roomId: string;
  timeFormatted: string;
  isUrgent: boolean;
  onDestroyRoom: () => void;
  isDestroying: boolean;
}

export function ChatHeader({
  roomId,
  timeFormatted,
  isUrgent,
  onDestroyRoom,
  isDestroying,
}: ChatHeaderProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copyLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopyStatus("copied");

    // Clear any existing timeout
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    // Set new timeout
    copyTimeoutRef.current = setTimeout(() => {
      setCopyStatus("idle");
      copyTimeoutRef.current = null;
    }, 2000);
  }, []);

  // Cleanup copy timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="border-b border-border p-4 flex items-center justify-between bg-card/50">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Room ID
          </span>
          <div className="flex items-center gap-2">
            {/* Room ID */}
            <span className="font-bold text-primary truncate">
              {roomId.slice(0, 10) + "..."}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={copyLink}
              className="h-6 w-6"
            >
              {copyStatus === "copied" ? (
                <Check className="size-3 text-primary" />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Separator */}
        <div className="w-0.5 bg-muted-foreground h-8" />

        {/* Self-Destruct In */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Self-Destruct In
          </span>
          <span
            className={`text-sm font-bold ${
              isUrgent ? "text-destructive" : "text-warning"
            }`}
          >
            {timeFormatted}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="default"
          onClick={onDestroyRoom}
          disabled={isDestroying}
          className="font-bold"
        >
          <Bomb className="size-4" />
          {isDestroying ? (
            <span className="hidden sm:block">DESTROYING...</span>
          ) : (
            <span className="hidden sm:block">DESTROY ROOM</span>
          )}
        </Button>
        <div className="hidden sm:block">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
