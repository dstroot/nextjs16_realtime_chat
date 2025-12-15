import { useLayoutEffect, useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat-message";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  token?: string;
}

interface MessageListProps {
  messages: Message[];
  encryptionKey: string | null;
  currentUsername: string;
}

export function MessageList({
  messages,
  encryptionKey,
  currentUsername,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages fill scroll area
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 grow overflow-hidden">
      <div className="p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground text-sm font-mono">
              Click copy link under ROOM ID above and share it with someone to
              start chatting!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            id={msg.id}
            sender={msg.sender}
            text={msg.text}
            encryptionKey={encryptionKey}
            timestamp={msg.timestamp}
            currentUsername={currentUsername}
          />
        ))}
      </div>
      <div ref={messagesEndRef} />
      <ScrollBar />
    </ScrollArea>
  );
}
