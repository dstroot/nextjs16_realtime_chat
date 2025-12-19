import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChatMessage } from "@/components/chat-message";
import { format } from "date-fns";

vi.mock("@/hooks/use-decrypted-message", () => ({
  useDecryptedMessage: () => ({ message: "decrypted text", isLoading: false }),
}));

describe("ChatMessage", () => {
  it("renders YOU when sender is currentUsername and shows decrypted text and timestamp", () => {
    const timestamp = Date.now();
    render(
      <ChatMessage
        id="1"
        sender="me"
        text="abc"
        encryptionKey={null}
        timestamp={timestamp}
        currentUsername="me"
      />
    );

    expect(screen.getByText("YOU")).toBeInTheDocument();
    expect(screen.getByText("decrypted text")).toBeInTheDocument();
    const timeLabel = `@ ${format(timestamp, "HH:mm:ss")}`;
    expect(screen.getByText(timeLabel)).toBeInTheDocument();
  });
});
