import { format } from "date-fns";
import { memo } from "react";

interface ChatMessageProps {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  currentUsername: string;
}

export const ChatMessage = memo(function ChatMessage({
  sender,
  text,
  timestamp,
  currentUsername,
}: ChatMessageProps) {
  const isOwnMessage = sender === currentUsername;

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
            {format(timestamp, "HH:mm:ss")}
          </span>
        </div>

        <p className="text-sm text-foreground leading-relaxed break-all">
          {text}
        </p>
      </div>
    </div>
  );
});
