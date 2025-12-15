import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isPending: boolean;
}

export function ChatInput({
  input,
  onInputChange,
  onSendMessage,
  isPending,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = useCallback(() => {
    if (input.trim()) {
      onSendMessage();
      inputRef.current?.focus();
    }
  }, [input, onSendMessage]);

  return (
    <div className="p-4 border-t border-border bg-card/50">
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
            onChange={(e) => onInputChange(e.target.value)}
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
  );
}
