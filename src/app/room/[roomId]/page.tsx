"use client";

import { useUsername } from "@/hooks/use-username";
import { useCountdown } from "@/hooks/use-countdown";
import { client } from "@/lib/client";
import { useRealtime } from "@/lib/realtime-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Bomb } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { ChatMessage } from "@/components/chat-message";
import { toast } from "sonner";

const Page = () => {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();

  const { username } = useUsername();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  // Fetch initial TTL
  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { roomId } });
      return res.data;
    },
  });

  // Countdown hook
  const handleCountdownComplete = useCallback(() => {
    router.push("/?destroyed=true");
  }, [router]);

  const { formatted: timeFormatted, isUrgent } = useCountdown({
    initialSeconds: ttlData?.ttl ?? null,
    onComplete: handleCountdownComplete,
  });

  // Fetch messages
  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await client.messages.get({ query: { roomId } });
      return res.data;
    },
  });

  // Send message mutation
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await client.messages.post(
        { sender: username, text },
        { query: { roomId } }
      );
      setInput("");
    },
    onError: (error) => {
      toast.error("Failed to send message", {
        description: error.message || "Please try again.",
      });
    },
  });

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (input.trim()) {
      sendMessage({ text: input });
      inputRef.current?.focus();
    }
  }, [input, sendMessage]);

  // Realtime subscription
  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetch();
      }

      if (event === "chat.destroy") {
        router.push("/?destroyed=true");
      }
    },
  });

  // Destroy room mutation
  const { mutate: destroyRoom, isPending: isDestroying } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } });
    },
    onError: (error) => {
      toast.error("Failed to destroy room", {
        description: error.message || "Please try again.",
      });
    },
  });

  // Copy link handler
  const copyLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopyStatus("copied");
    // toast.success("Link copied to clipboard");
    setTimeout(() => setCopyStatus("idle"), 1500);
  }, []);

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Room ID
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-500 truncate">
                {roomId.slice(0, 10) + "..."}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={copyLink}
                className="h-6 w-6"
              >
                {copyStatus === "copied" ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="w-0.5 bg-muted-foreground h-8" />

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Self-Destruct In
            </span>
            <span
              className={`text-sm font-bold ${
                isUrgent ? "text-red-500" : "text-amber-500"
              }`}
            >
              {timeFormatted}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="destructive"
            size="default"
            onClick={() => destroyRoom()}
            disabled={isDestroying}
            className="font-bold"
          >
            <Bomb className="size-4" />
            {isDestroying ? "DESTROYING..." : "DESTROY ROOM NOW"}
          </Button>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages?.messages.length === 0 && (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <p className="text-muted-foreground text-sm font-mono">
                No messages yet, start the conversation.
              </p>
            </div>
          )}

          {messages?.messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              id={msg.id}
              sender={msg.sender}
              text={msg.text}
              timestamp={msg.timestamp}
              currentUsername={username}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/30">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 animate-pulse font-mono">
              {">"}
            </span>
            <Input
              ref={inputRef}
              autoFocus
              type="text"
              value={input}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder="Type message..."
              onChange={(e) => setInput(e.target.value)}
              className="pl-7 bg-background border-border"
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isPending}
            className="font-bold"
          >
            {isPending ? "SENDING..." : "SEND"}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Page;
