import { format } from "date-fns";
import { memo } from "react";
import { decrypt } from "@/lib/encryption";
import { useQuery } from "@tanstack/react-query";

interface ChatMessageProps {
  id: string;
  sender: string;
  text: string;
  encryptionKey: string | null;
  timestamp: number;
  currentUsername: string;
}

export const ChatMessage = memo(function ChatMessage({
  sender,
  text,
  encryptionKey,
  timestamp,
  currentUsername,
}: ChatMessageProps) {
  const isOwnMessage = sender === currentUsername;

  const DecryptedMessage = ({
    text,
    encryptionKey,
  }: {
    text: string;
    encryptionKey: string | null;
  }) => {
    // Decrypt the message
    const { data: decrypted } = useQuery({
      queryKey: ["decrypted", text, encryptionKey],
      queryFn: async () => {
        if (!encryptionKey) return null;
        return await decrypt(text, encryptionKey);
      },
      staleTime: Infinity,
      retry: false,
    });

    // Case 1: No key provided
    if (!encryptionKey) {
      return "Missing encryption key";
    }

    // Case 2: Key provided but decryption failed
    if (decrypted === null && encryptionKey) {
      return "Decryption Failed";
    }

    // Case 3: Success
    return decrypted;
  };

  return (
    <div className="flex flex-col items-start">
      <div className="max-w-[80%] group">
        <div className="flex items-baseline gap-3 mb-1">
          <span
            className={`text-xs font-bold ${
              isOwnMessage ? "text-green-500" : "text-blue-500"
            }`}
          >
            {isOwnMessage ? "YOU" : sender}
          </span>

          <span className="text-[10px] text-muted-foreground">
            {`SENT ${format(timestamp, "HH:mm:ss")}`}
          </span>
        </div>

        <p className="text-sm text-foreground leading-relaxed wrap-break-word whitespace-pre-wrap">
          {DecryptedMessage({ text, encryptionKey })}
        </p>
      </div>
    </div>
  );
});
