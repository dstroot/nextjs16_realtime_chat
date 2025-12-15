"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// hooks
import { useUsername } from "@/hooks/use-username";
import { useCountdown } from "@/hooks/use-countdown";
import { useEncryptionKey } from "@/hooks/use-encryption-key";
import { useTTL } from "@/hooks/use-ttl";
import { useMessages } from "@/hooks/use-messages";
import { useRoomDestruction } from "@/hooks/use-room-destruction";
import { useRoomRealtime } from "@/hooks/use-room-realtime";

// components
import { ChatHeader } from "@/components/chat-header";
import { MessageList } from "@/components/message-list";
import { ChatInput } from "@/components/chat-input";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const { username } = useUsername();
  const roomId = params.roomId as string;

  // State
  const [input, setInput] = useState("");

  // Custom hooks
  const encryptionKey = useEncryptionKey();
  const ttlData = useTTL(roomId);
  const { messages, sendMessage, isPending, refetch } = useMessages(
    roomId,
    encryptionKey
  );
  const { destroyRoom, isDestroying } = useRoomDestruction(roomId);

  // Countdown hook
  const handleCountdownComplete = useCallback(() => {
    router.push("/?destroyed=true");
  }, [router]);

  const { formatted: timeFormatted, isUrgent } = useCountdown({
    initialSeconds: ttlData?.ttl ?? null,
    onComplete: handleCountdownComplete,
  });

  // Realtime subscription
  useRoomRealtime(roomId, refetch);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  }, [input, sendMessage]);

  return (
    <main className="flex flex-col h-dvh max-h-dvh">
      <ChatHeader
        roomId={roomId}
        timeFormatted={timeFormatted}
        isUrgent={isUrgent}
        onDestroyRoom={() => destroyRoom()}
        isDestroying={isDestroying}
      />

      <MessageList
        messages={messages}
        encryptionKey={encryptionKey}
        currentUsername={username}
      />

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSendMessage={handleSendMessage}
        isPending={isPending}
      />
    </main>
  );
};

export default Page;
